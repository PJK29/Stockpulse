import { prisma } from '../db/prisma.js';
import { ProductCategory, ProductLifecycle, TriggerReason } from '../domain/types.js';
import { ProductStateMachine } from '../domain/stateMachines.js';
import { recommendationLoop } from '../agent/recommendationLoop.js';

export interface ICreateProductDTO {
  sku: string;
  name: string;
  category: ProductCategory;
  currentPrice: number;
  stockLevel: number;
  reorderThreshold: number;
  costPrice?: number;
  supplierId?: string;
  marginFloor?: number;
  competitorPrice?: number;
}

export class ProductService {
  public async createProduct(data: ICreateProductDTO) {
    const lifecycle = data.stockLevel <= 0 ? ProductLifecycle.OUT_OF_STOCK : ProductLifecycle.ACTIVE;

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        currentPrice: data.currentPrice,
        stockLevel: data.stockLevel,
        reorderThreshold: data.reorderThreshold,
        demandVelocity: 0,
        lifecycle,
        costPrice: data.costPrice,
        supplierId: data.supplierId,
        marginFloor: data.marginFloor,
        competitorPrice: data.competitorPrice,
      },
    });

    // Record initial snapshot
    await prisma.inventorySnapshot.create({
      data: {
        productId: product.id,
        stockLevel: product.stockLevel,
        demandVelocity: 0,
        triggerEvent: 'PRODUCT_CREATED',
      },
    });

    // If initial stock is below threshold, dispatch evaluation
    if (product.stockLevel <= product.reorderThreshold) {
      recommendationLoop.dispatchAsync(product.id, TriggerReason.INVENTORY_LOW);
    }

    return product;
  }

  public async getProducts(filters?: {
    category?: ProductCategory;
    status?: ProductLifecycle;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.lifecycle = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ lifecycle: 'asc' }, { updatedAt: 'desc' }],
      include: {
        pricingSuggestions: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        reorderSuggestions: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return products;
  }

  public async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        pricingSuggestions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reorderSuggestions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        snapshots: {
          orderBy: { timestamp: 'desc' },
          take: 15,
        },
        orders: {
          orderBy: { timestamp: 'desc' },
          take: 15,
        },
      },
    });

    return product;
  }

  public async updateStock(id: string, newStockLevel: number) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        pricingSuggestions: { where: { status: 'PENDING' } },
      },
    });

    if (!existing) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const hasPendingReviews = existing.pricingSuggestions.length > 0;
    const derivedLifecycle = ProductStateMachine.deriveLifecycle(newStockLevel, hasPendingReviews);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stockLevel: newStockLevel,
        lifecycle: derivedLifecycle,
      },
    });

    // Record inventory snapshot
    await prisma.inventorySnapshot.create({
      data: {
        productId: updated.id,
        stockLevel: updated.stockLevel,
        demandVelocity: updated.demandVelocity,
        triggerEvent: 'MANUAL_STOCK_UPDATE',
      },
    });

    // Agentic loop trigger check: if stock crosses below threshold
    if (newStockLevel <= updated.reorderThreshold) {
      recommendationLoop.dispatchAsync(updated.id, TriggerReason.INVENTORY_LOW);
    }

    return updated;
  }
}

export const productService = new ProductService();
