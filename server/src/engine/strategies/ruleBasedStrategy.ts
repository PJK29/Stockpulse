import {
  ICommerceEvaluationContext,
  IPricingRecommendation,
  IReorderRecommendation,
  PriceChangeDirection,
  ProductCategory,
  StrategyType,
  TriggerReason,
} from '../../domain/types.js';
import { IPricingStrategy, IReorderStrategy } from '../interfaces.js';

export class RuleBasedPricingStrategy implements IPricingStrategy {
  readonly strategyType = StrategyType.RULE_BASED;
  readonly name = 'Rule-Based Heuristic Pricing';

  async evaluatePricing(context: ICommerceEvaluationContext): Promise<IPricingRecommendation> {
    const { product, triggerReason } = context;
    const { currentPrice, stockLevel, reorderThreshold, demandVelocity, costPrice, marginFloor } = product;

    let changeDirection = PriceChangeDirection.HOLD;
    let priceMultiplier = 1.0;
    let confidence = 0.85;
    let reasoning = '';

    const isStockCriticallyLow = stockLevel <= Math.max(1, Math.floor(reorderThreshold * 0.5));
    const isStockBelowThreshold = stockLevel <= reorderThreshold;
    const isHighVelocity = demandVelocity >= 6;
    const isModerateVelocity = demandVelocity >= 3;

    if (triggerReason === TriggerReason.DEMAND_SPIKE || (isHighVelocity && isStockBelowThreshold)) {
      // High demand spike + scarce stock
      priceMultiplier = 1.20; // +20%
      changeDirection = PriceChangeDirection.INCREASE;
      confidence = 0.92;
      reasoning = `Demand velocity surging (${demandVelocity} units/24h) while stock is critically constrained (${stockLevel} remaining vs ${reorderThreshold} threshold). Recommending a 20% price increase to preserve stock buffer and optimize revenue per unit.`;
    } else if (triggerReason === TriggerReason.INVENTORY_LOW || isStockCriticallyLow) {
      // Low stock protection
      priceMultiplier = 1.10; // +10%
      changeDirection = PriceChangeDirection.INCREASE;
      confidence = 0.88;
      reasoning = `Inventory has depleted to ${stockLevel} units (below reorder threshold of ${reorderThreshold}). Recommending a 10% price increase to throttle run-rate until inbound replenishment arrives.`;
    } else if (isHighVelocity && !isStockBelowThreshold) {
      // Strong demand with healthy stock
      priceMultiplier = 1.06; // +6%
      changeDirection = PriceChangeDirection.INCREASE;
      confidence = 0.84;
      reasoning = `Strong 24-hour demand velocity (${demandVelocity} orders) on healthy inventory. Capturing an additional 6% margin premium without dampening conversion rates.`;
    } else if (stockLevel > reorderThreshold * 3 && demandVelocity <= 1) {
      // Overstocked / slow moving
      priceMultiplier = 0.88; // -12%
      changeDirection = PriceChangeDirection.DECREASE;
      confidence = 0.80;
      reasoning = `High inventory overhang (${stockLevel} units) relative to subdued demand (${demandVelocity} orders/24h). Recommending a 12% promotional reduction to stimulate velocity and reduce holding costs.`;
    } else {
      // Steady baseline
      changeDirection = PriceChangeDirection.HOLD;
      confidence = 0.95;
      reasoning = `Product inventory (${stockLevel} units) and sales velocity (${demandVelocity} orders/24h) are well-calibrated. Maintaining current price of $${currentPrice.toFixed(2)}.`;
    }

    let recommendedPrice = Number((currentPrice * priceMultiplier).toFixed(2));

    // Sprint 2 margin floor check
    if (costPrice !== null && costPrice !== undefined) {
      const minMargin = marginFloor ?? 0.15; // default 15% margin floor
      const minAllowedPrice = Number((costPrice * (1 + minMargin)).toFixed(2));
      if (recommendedPrice < minAllowedPrice) {
        recommendedPrice = minAllowedPrice;
        if (recommendedPrice > currentPrice) {
          changeDirection = PriceChangeDirection.INCREASE;
        } else if (recommendedPrice < currentPrice) {
          changeDirection = PriceChangeDirection.DECREASE;
        } else {
          changeDirection = PriceChangeDirection.HOLD;
        }
        reasoning += ` (Adjusted to respect minimum margin floor of ${(minMargin * 100).toFixed(0)}% over cost of $${costPrice.toFixed(2)}).`;
      }
    }

    return {
      recommendedPrice,
      changeDirection,
      confidence,
      reasoning,
    };
  }
}

export class RuleBasedReorderStrategy implements IReorderStrategy {
  readonly strategyType = StrategyType.RULE_BASED;
  readonly name = 'Rule-Based EOQ & Safety Stock Reorder';

  async evaluateReorder(context: ICommerceEvaluationContext): Promise<IReorderRecommendation> {
    const { product } = context;
    const { category, stockLevel, reorderThreshold, demandVelocity } = product;

    // Default category lead time estimates (days)
    const categoryLeadTimes: Record<ProductCategory, number> = {
      [ProductCategory.ELECTRONICS]: 7,
      [ProductCategory.APPAREL]: 5,
      [ProductCategory.HOME]: 10,
    };

    const leadTimeDays = categoryLeadTimes[category] || 7;
    const effectiveDailyDemand = Math.max(1, Math.ceil(demandVelocity * 0.8));
    const leadTimeDemand = effectiveDailyDemand * leadTimeDays;
    const safetyStock = Math.ceil(reorderThreshold * 1.25);
    const targetInventory = leadTimeDemand + safetyStock;

    const rawReorderQty = Math.max(15, targetInventory - Math.max(0, stockLevel));
    // Round to nearest multiple of 5 for standard merchant purchase order batching
    const recommendedQuantity = Math.ceil(rawReorderQty / 5) * 5;

    const confidence = demandVelocity >= 5 ? 0.94 : 0.89;
    const reasoning = `Reorder recommendation calculated for ${leadTimeDays}-day lead time (estimated lead demand: ${leadTimeDemand} units, safety stock buffer: ${safetyStock} units). Batch order of ${recommendedQuantity} units restores optimal inventory balance.`;

    return {
      recommendedQuantity,
      suggestedLeadTimeDays: leadTimeDays,
      confidence,
      reasoning,
    };
  }
}
