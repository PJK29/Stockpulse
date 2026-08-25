import { prisma } from '../db/prisma.js';
import { ProductStateMachine, SuggestionStateMachine } from '../domain/stateMachines.js';
import { SuggestionStatus, TriggerReason } from '../domain/types.js';
import { recommendationLoop } from '../agent/recommendationLoop.js';

export class SuggestionService {
  public async getPricingSuggestions(filters?: { status?: SuggestionStatus; productId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.productId) where.productId = filters.productId;

    return prisma.pricingSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    });
  }

  public async getReorderSuggestions(filters?: { status?: SuggestionStatus; productId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.productId) where.productId = filters.productId;

    return prisma.reorderSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    });
  }

  public async resolvePricingSuggestion(id: string, newStatus: SuggestionStatus) {
    const suggestion = await prisma.pricingSuggestion.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!suggestion) {
      throw new Error(`Pricing suggestion ${id} not found.`);
    }

    SuggestionStateMachine.validateTransition(
      suggestion.status as SuggestionStatus,
      newStatus
    );

    const isAccepted = newStatus === SuggestionStatus.ACCEPTED;

    // 1. Update Suggestion
    const updatedSuggestion = await prisma.pricingSuggestion.update({
      where: { id },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
      },
    });

    // 2. If Accepted, update product price
    let updatedPrice = suggestion.product.currentPrice;
    if (isAccepted) {
      updatedPrice = suggestion.recommendedPrice;
      await prisma.product.update({
        where: { id: suggestion.productId },
        data: { currentPrice: updatedPrice },
      });
    }

    // 3. Re-evaluate Product Lifecycle
    // Check if there are other pending pricing suggestions for this product
    const otherPending = await prisma.pricingSuggestion.count({
      where: {
        productId: suggestion.productId,
        status: SuggestionStatus.PENDING,
        id: { not: id },
      },
    });

    const nextLifecycle = ProductStateMachine.deriveLifecycle(
      suggestion.product.stockLevel,
      otherPending > 0
    );

    const updatedProduct = await prisma.product.update({
      where: { id: suggestion.productId },
      data: { lifecycle: nextLifecycle },
    });

    // 4. Record Snapshot
    await prisma.inventorySnapshot.create({
      data: {
        productId: suggestion.productId,
        stockLevel: updatedProduct.stockLevel,
        demandVelocity: updatedProduct.demandVelocity,
        triggerEvent: `PRICING_${newStatus}_NEW_PRICE_${updatedPrice}`,
      },
    });

    return {
      suggestion: updatedSuggestion,
      product: updatedProduct,
    };
  }

  public async resolveReorderSuggestion(id: string, newStatus: SuggestionStatus) {
    const suggestion = await prisma.reorderSuggestion.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!suggestion) {
      throw new Error(`Reorder suggestion ${id} not found.`);
    }

    SuggestionStateMachine.validateTransition(
      suggestion.status as SuggestionStatus,
      newStatus
    );

    const isAccepted = newStatus === SuggestionStatus.ACCEPTED;

    // 1. Update Suggestion
    const updatedSuggestion = await prisma.reorderSuggestion.update({
      where: { id },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
      },
    });

    // 2. If Accepted, simulate inbound replenishment shipment
    let newStockLevel = suggestion.product.stockLevel;
    if (isAccepted) {
      newStockLevel += suggestion.recommendedQuantity;
    }

    // 3. Update Product Stock and derive Lifecycle
    const pendingPricingCount = await prisma.pricingSuggestion.count({
      where: {
        productId: suggestion.productId,
        status: SuggestionStatus.PENDING,
      },
    });

    const nextLifecycle = ProductStateMachine.deriveLifecycle(
      newStockLevel,
      pendingPricingCount > 0
    );

    const updatedProduct = await prisma.product.update({
      where: { id: suggestion.productId },
      data: {
        stockLevel: newStockLevel,
        lifecycle: nextLifecycle,
      },
    });

    // 4. Record Snapshot
    await prisma.inventorySnapshot.create({
      data: {
        productId: suggestion.productId,
        stockLevel: updatedProduct.stockLevel,
        demandVelocity: updatedProduct.demandVelocity,
        triggerEvent: `REORDER_${newStatus}_INBOUND_${isAccepted ? suggestion.recommendedQuantity : 0}`,
      },
    });

    return {
      suggestion: updatedSuggestion,
      product: updatedProduct,
    };
  }

  public async requestManualPricing(productId: string) {
    return recommendationLoop.evaluateProductSignals(productId, TriggerReason.MANUAL);
  }

  public async requestManualReorder(productId: string) {
    return recommendationLoop.evaluateProductSignals(productId, TriggerReason.MANUAL);
  }
}

export const suggestionService = new SuggestionService();
