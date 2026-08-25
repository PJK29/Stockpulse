import { prisma } from '../db/prisma.js';
import {
  IProduct,
  PriceChangeDirection,
  ProductLifecycle,
  SuggestionStatus,
  TriggerReason,
} from '../domain/types.js';
import { commerceEngine } from '../engine/commerceEngine.js';

export interface IEvaluationResult {
  triggered: boolean;
  triggerReason?: TriggerReason;
  pricingSuggestionId?: string;
  reorderSuggestionId?: string;
  reason?: string;
}

export class RecommendationLoop {
  private static instance: RecommendationLoop;

  public static getInstance(): RecommendationLoop {
    if (!RecommendationLoop.instance) {
      RecommendationLoop.instance = new RecommendationLoop();
    }
    return RecommendationLoop.instance;
  }

  /**
   * Evaluates inventory and velocity signals on a product.
   * Runs asynchronously in the background.
   */
  public async evaluateProductSignals(
    productId: string,
    forcedTrigger?: TriggerReason
  ): Promise<IEvaluationResult> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return { triggered: false, reason: `Product ${productId} not found.` };
      }

      // Determine Trigger Reason
      let triggerReason: TriggerReason | null = forcedTrigger || null;

      if (!triggerReason) {
        const isInventoryLow = product.stockLevel <= product.reorderThreshold;
        const isDemandSpike = product.demandVelocity >= 5;

        if (isDemandSpike && isInventoryLow) {
          triggerReason = TriggerReason.DEMAND_SPIKE; // High priority trigger
        } else if (isDemandSpike) {
          triggerReason = TriggerReason.DEMAND_SPIKE;
        } else if (isInventoryLow) {
          triggerReason = TriggerReason.INVENTORY_LOW;
        }
      }

      if (!triggerReason) {
        return {
          triggered: false,
          reason: 'Product signals are within healthy baseline parameters. No action required.',
        };
      }

      const activeStrategy = commerceEngine.getActiveStrategy();
      const domainProduct: IProduct = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category as any,
        currentPrice: product.currentPrice,
        stockLevel: product.stockLevel,
        reorderThreshold: product.reorderThreshold,
        demandVelocity: product.demandVelocity,
        lifecycle: product.lifecycle as any,
        costPrice: product.costPrice,
        supplierId: product.supplierId,
        marginFloor: product.marginFloor,
        competitorPrice: product.competitorPrice,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      const evalContext = {
        product: domainProduct,
        triggerReason,
      };

      // 1. Evaluate Pricing Recommendation
      const pricingRec = await commerceEngine.evaluatePricing(evalContext);

      // Check Deduplication for Pricing Suggestion
      // If a pending pricing suggestion exists with the same trigger reason and recommended price, skip to avoid spam
      const existingPendingPricing = await prisma.pricingSuggestion.findFirst({
        where: {
          productId: product.id,
          status: SuggestionStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      let createdPricingId = existingPendingPricing?.id;

      if (!existingPendingPricing || existingPendingPricing.triggerReason !== triggerReason || existingPendingPricing.recommendedPrice !== pricingRec.recommendedPrice) {
        const newPricing = await prisma.pricingSuggestion.create({
          data: {
            productId: product.id,
            currentPrice: product.currentPrice,
            recommendedPrice: pricingRec.recommendedPrice,
            changeDirection: pricingRec.changeDirection,
            confidence: pricingRec.confidence,
            reasoning: pricingRec.reasoning,
            status: SuggestionStatus.PENDING,
            triggerReason,
            strategyUsed: activeStrategy,
          },
        });
        createdPricingId = newPricing.id;
      }

      // 2. Evaluate Reorder Recommendation if low inventory, demand spike, or manual
      let createdReorderId: string | undefined;
      const shouldEvaluateReorder =
        triggerReason === TriggerReason.INVENTORY_LOW ||
        triggerReason === TriggerReason.DEMAND_SPIKE ||
        triggerReason === TriggerReason.MANUAL ||
        product.stockLevel <= product.reorderThreshold;

      if (shouldEvaluateReorder) {
        const reorderRec = await commerceEngine.evaluateReorder(evalContext);

        const existingPendingReorder = await prisma.reorderSuggestion.findFirst({
          where: {
            productId: product.id,
            status: SuggestionStatus.PENDING,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!existingPendingReorder || existingPendingReorder.triggerReason !== triggerReason) {
          const newReorder = await prisma.reorderSuggestion.create({
            data: {
              productId: product.id,
              currentStock: product.stockLevel,
              recommendedQuantity: reorderRec.recommendedQuantity,
              suggestedLeadTimeDays: reorderRec.suggestedLeadTimeDays,
              confidence: reorderRec.confidence,
              reasoning: reorderRec.reasoning,
              status: SuggestionStatus.PENDING,
              triggerReason,
              strategyUsed: activeStrategy,
            },
          });
          createdReorderId = newReorder.id;
        } else {
          createdReorderId = existingPendingReorder.id;
        }
      }

      // 3. Update Product Lifecycle to PRICE_REVIEW_PENDING (unless stock is 0 -> OUT_OF_STOCK)
      const nextLifecycle =
        product.stockLevel <= 0 ? ProductLifecycle.OUT_OF_STOCK : ProductLifecycle.PRICE_REVIEW_PENDING;

      if (product.lifecycle !== nextLifecycle) {
        await prisma.product.update({
          where: { id: product.id },
          data: { lifecycle: nextLifecycle },
        });
      }

      // 4. Record Inventory Snapshot
      await prisma.inventorySnapshot.create({
        data: {
          productId: product.id,
          stockLevel: product.stockLevel,
          demandVelocity: product.demandVelocity,
          triggerEvent: `AGENTIC_EVALUATION_${triggerReason}`,
        },
      });

      console.log(
        `[AgenticRecommendationLoop] Evaluated product ${product.sku} (${product.name}) -> Trigger: ${triggerReason} | Strategy: ${activeStrategy}`
      );

      return {
        triggered: true,
        triggerReason,
        pricingSuggestionId: createdPricingId,
        reorderSuggestionId: createdReorderId,
        reason: `Generated suggestions triggered by ${triggerReason} via ${activeStrategy}`,
      };
    } catch (err: any) {
      console.error('[AgenticRecommendationLoop] Error during background evaluation:', err);
      return { triggered: false, reason: err.message };
    }
  }

  /**
   * Dispatches evaluation asynchronously without blocking the caller request
   */
  public dispatchAsync(productId: string, trigger?: TriggerReason): void {
    setImmediate(async () => {
      try {
        await this.evaluateProductSignals(productId, trigger);
      } catch (e) {
        console.error('[AgenticRecommendationLoop] Async dispatch failure:', e);
      }
    });
  }
}

export const recommendationLoop = RecommendationLoop.getInstance();
