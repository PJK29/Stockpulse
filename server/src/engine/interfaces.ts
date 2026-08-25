import {
  ICommerceEvaluationContext,
  IPricingRecommendation,
  IReorderRecommendation,
  StrategyType,
} from '../domain/types.js';

export interface IPricingStrategy {
  readonly strategyType: StrategyType;
  readonly name: string;
  evaluatePricing(context: ICommerceEvaluationContext): Promise<IPricingRecommendation>;
}

export interface IReorderStrategy {
  readonly strategyType: StrategyType;
  readonly name: string;
  evaluateReorder(context: ICommerceEvaluationContext): Promise<IReorderRecommendation>;
}
