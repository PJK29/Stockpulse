import {
  ICommerceEvaluationContext,
  IPricingRecommendation,
  IReorderRecommendation,
  StrategyType,
} from '../domain/types.js';
import { IPricingStrategy, IReorderStrategy } from './interfaces.js';
import { RuleBasedPricingStrategy, RuleBasedReorderStrategy } from './strategies/ruleBasedStrategy.js';
import { GeminiPricingStrategy, GeminiReorderStrategy } from './strategies/geminiStrategy.js';
import { prisma } from '../db/prisma.js';

export class CommerceEngine {
  private static instance: CommerceEngine;
  private pricingStrategies: Map<StrategyType, IPricingStrategy> = new Map();
  private reorderStrategies: Map<StrategyType, IReorderStrategy> = new Map();
  private activeStrategy: StrategyType = StrategyType.RULE_BASED;
  private initialized: boolean = false;

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): CommerceEngine {
    if (!CommerceEngine.instance) {
      CommerceEngine.instance = new CommerceEngine();
    }
    return CommerceEngine.instance;
  }

  private registerDefaults(): void {
    const rulePricing = new RuleBasedPricingStrategy();
    const ruleReorder = new RuleBasedReorderStrategy();
    const geminiPricing = new GeminiPricingStrategy();
    const geminiReorder = new GeminiReorderStrategy();

    this.pricingStrategies.set(rulePricing.strategyType, rulePricing);
    this.pricingStrategies.set(geminiPricing.strategyType, geminiPricing);

    this.reorderStrategies.set(ruleReorder.strategyType, ruleReorder);
    this.reorderStrategies.set(geminiReorder.strategyType, geminiReorder);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { id: 'active_config' },
      });
      if (config) {
        this.activeStrategy = config.activeStrategy as StrategyType;
      } else {
        await prisma.systemConfig.upsert({
          where: { id: 'active_config' },
          update: {},
          create: {
            id: 'active_config',
            activeStrategy: StrategyType.RULE_BASED,
          },
        });
      }
      this.initialized = true;
      console.log(`[CommerceEngine] Initialized with active strategy: ${this.activeStrategy}`);
    } catch (err) {
      console.warn('[CommerceEngine] Database config lookup skipped during initial startup:', err);
    }
  }

  public getActiveStrategy(): StrategyType {
    return this.activeStrategy;
  }

  public async setActiveStrategy(strategy: StrategyType): Promise<StrategyType> {
    if (!this.pricingStrategies.has(strategy)) {
      throw new Error(`Strategy ${strategy} is not registered in CommerceEngine.`);
    }
    this.activeStrategy = strategy;
    try {
      await prisma.systemConfig.upsert({
        where: { id: 'active_config' },
        update: { activeStrategy: strategy },
        create: {
          id: 'active_config',
          activeStrategy: strategy,
        },
      });
    } catch (err) {
      console.warn('[CommerceEngine] Failed to persist active strategy to DB:', err);
    }
    console.log(`[CommerceEngine] Switched active strategy to: ${strategy}`);
    return this.activeStrategy;
  }

  public getAvailableStrategies(): { type: StrategyType; pricingName: string; reorderName: string }[] {
    return Array.from(this.pricingStrategies.keys()).map((type) => ({
      type,
      pricingName: this.pricingStrategies.get(type)?.name || type,
      reorderName: this.reorderStrategies.get(type)?.name || type,
    }));
  }

  public async evaluatePricing(context: ICommerceEvaluationContext): Promise<IPricingRecommendation> {
    const strategy = this.pricingStrategies.get(this.activeStrategy) || this.pricingStrategies.get(StrategyType.RULE_BASED)!;
    return strategy.evaluatePricing(context);
  }

  public async evaluateReorder(context: ICommerceEvaluationContext): Promise<IReorderRecommendation> {
    const strategy = this.reorderStrategies.get(this.activeStrategy) || this.reorderStrategies.get(StrategyType.RULE_BASED)!;
    return strategy.evaluateReorder(context);
  }
}

export const commerceEngine = CommerceEngine.getInstance();
