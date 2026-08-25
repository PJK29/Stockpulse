import { prisma } from '../db/prisma.js';
import { ProductStateMachine } from '../domain/stateMachines.js';
import { TriggerReason } from '../domain/types.js';
import { recommendationLoop } from '../agent/recommendationLoop.js';

export interface ISimulateOrderDTO {
  productId: string;
  quantity?: number;
}

export class OrderService {
  public async simulateSale(dto: ISimulateOrderDTO) {
    const { productId } = dto;
    const quantity = Math.max(1, dto.quantity || 1);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        pricingSuggestions: { where: { status: 'PENDING' } },
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    if (product.stockLevel <= 0) {
      throw new Error(`Product ${product.sku} is already OUT OF STOCK. Cannot fulfill sale.`);
    }

    // Decrement stock (minimum 0)
    const actualQuantity = Math.min(product.stockLevel, quantity);
    const newStockLevel = Math.max(0, product.stockLevel - actualQuantity);

    // Calculate rolling 24h demand velocity
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOrders = await prisma.orderLog.findMany({
      where: {
        productId,
        timestamp: { gte: oneDayAgo },
      },
    });

    const historicalVelocity = recentOrders.reduce((sum, o) => sum + o.quantity, 0);
    const newDemandVelocity = historicalVelocity + actualQuantity;

    // Log the new order
    const orderLog = await prisma.orderLog.create({
      data: {
        productId,
        quantity: actualQuantity,
        unitPrice: product.currentPrice,
      },
    });

    const hasPendingReviews = product.pricingSuggestions.length > 0;
    const derivedLifecycle = ProductStateMachine.deriveLifecycle(newStockLevel, hasPendingReviews);

    // Update product stock and demand velocity
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockLevel: newStockLevel,
        demandVelocity: newDemandVelocity,
        lifecycle: derivedLifecycle,
      },
    });

    // Record inventory snapshot
    await prisma.inventorySnapshot.create({
      data: {
        productId,
        stockLevel: newStockLevel,
        demandVelocity: newDemandVelocity,
        triggerEvent: `SALE_SIMULATION_QTY_${actualQuantity}`,
      },
    });

    // Determine if signal triggers recommendation loop
    const isDemandSpike = newDemandVelocity >= 5;
    const isInventoryLow = newStockLevel <= product.reorderThreshold;

    let triggerReason: TriggerReason | undefined;
    if (isDemandSpike) {
      triggerReason = TriggerReason.DEMAND_SPIKE;
    } else if (isInventoryLow) {
      triggerReason = TriggerReason.INVENTORY_LOW;
    }

    if (triggerReason) {
      recommendationLoop.dispatchAsync(productId, triggerReason);
    }

    return {
      order: orderLog,
      product: updatedProduct,
      triggerReason: triggerReason || null,
      loopDispatched: Boolean(triggerReason),
    };
  }
}

export const orderService = new OrderService();
