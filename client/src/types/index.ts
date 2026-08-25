export type ProductCategory = 'ELECTRONICS' | 'APPAREL' | 'HOME';

export type ProductLifecycle = 'ACTIVE' | 'PRICE_REVIEW_PENDING' | 'OUT_OF_STOCK';

export type PriceChangeDirection = 'INCREASE' | 'DECREASE' | 'HOLD';

export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type TriggerReason = 'INITIAL' | 'INVENTORY_LOW' | 'DEMAND_SPIKE' | 'MANUAL';

export type StrategyType = 'RULE_BASED' | 'AI_GEMINI';

export interface Product {
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
  createdAt: string;
  updatedAt: string;
  pricingSuggestions?: PricingSuggestion[];
  reorderSuggestions?: ReorderSuggestion[];
  snapshots?: InventorySnapshot[];
  orders?: OrderLog[];
}

export interface PricingSuggestion {
  id: string;
  productId: string;
  product?: Product;
  currentPrice: number;
  recommendedPrice: number;
  changeDirection: PriceChangeDirection;
  confidence: number;
  reasoning: string;
  status: SuggestionStatus;
  triggerReason: TriggerReason;
  strategyUsed: StrategyType;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface ReorderSuggestion {
  id: string;
  productId: string;
  product?: Product;
  currentStock: number;
  recommendedQuantity: number;
  suggestedLeadTimeDays: number;
  confidence: number;
  reasoning: string;
  status: SuggestionStatus;
  triggerReason: TriggerReason;
  strategyUsed: StrategyType;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface InventorySnapshot {
  id: string;
  productId: string;
  stockLevel: number;
  demandVelocity: number;
  triggerEvent: string;
  timestamp: string;
}

export interface OrderLog {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  timestamp: string;
}

export interface EngineStatus {
  activeStrategy: StrategyType;
  availableStrategies: { type: StrategyType; pricingName: string; reorderName: string }[];
  geminiApiKeyConfigured: boolean;
}
