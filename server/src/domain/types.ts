export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  APPAREL = 'APPAREL',
  HOME = 'HOME',
}

export enum ProductLifecycle {
  ACTIVE = 'ACTIVE',
  PRICE_REVIEW_PENDING = 'PRICE_REVIEW_PENDING',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum PriceChangeDirection {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  HOLD = 'HOLD',
}

export enum SuggestionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum TriggerReason {
  INITIAL = 'INITIAL',
  INVENTORY_LOW = 'INVENTORY_LOW',
  DEMAND_SPIKE = 'DEMAND_SPIKE',
  MANUAL = 'MANUAL',
}

export enum StrategyType {
  RULE_BASED = 'RULE_BASED',
  AI_GEMINI = 'AI_GEMINI',
}

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  currentPrice: number;
  stockLevel: number;
  reorderThreshold: number;
  demandVelocity: number;
  lifecycle: ProductLifecycle;
  costPrice?: number | null;
  supplierId?: string | null;
  marginFloor?: number | null;
  competitorPrice?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPricingRecommendation {
  recommendedPrice: number;
  changeDirection: PriceChangeDirection;
  confidence: number;
  reasoning: string;
}

export interface IReorderRecommendation {
  recommendedQuantity: number;
  suggestedLeadTimeDays: number;
  confidence: number;
  reasoning: string;
}

export interface ICommerceEvaluationContext {
  product: IProduct;
  triggerReason: TriggerReason;
  recentOrdersCount?: number;
  currentStockRatio?: number; // stock / threshold
}
