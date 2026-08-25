import { ProductLifecycle, SuggestionStatus } from './types.js';

export class InvalidStateTransitionError extends Error {
  constructor(entity: string, from: string, to: string, reason?: string) {
    super(`Invalid ${entity} state transition from ${from} to ${to}.${reason ? ` Reason: ${reason}` : ''}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class ProductStateMachine {
  private static readonly VALID_TRANSITIONS: Record<ProductLifecycle, ProductLifecycle[]> = {
    [ProductLifecycle.ACTIVE]: [
      ProductLifecycle.PRICE_REVIEW_PENDING,
      ProductLifecycle.OUT_OF_STOCK,
      ProductLifecycle.ACTIVE, // Idempotent update
    ],
    [ProductLifecycle.PRICE_REVIEW_PENDING]: [
      ProductLifecycle.ACTIVE,
      ProductLifecycle.OUT_OF_STOCK,
      ProductLifecycle.PRICE_REVIEW_PENDING,
    ],
    [ProductLifecycle.OUT_OF_STOCK]: [
      ProductLifecycle.ACTIVE,
      ProductLifecycle.PRICE_REVIEW_PENDING,
      ProductLifecycle.OUT_OF_STOCK,
    ],
  };

  public static canTransition(current: ProductLifecycle, next: ProductLifecycle): boolean {
    return this.VALID_TRANSITIONS[current]?.includes(next) ?? false;
  }

  public static transition(
    current: ProductLifecycle,
    next: ProductLifecycle,
    options?: { stockLevel?: number; pendingReviewCount?: number }
  ): ProductLifecycle {
    if (!this.canTransition(current, next)) {
      throw new InvalidStateTransitionError('Product', current, next);
    }

    // Auto-resolve state based on stock level if provided
    if (options?.stockLevel !== undefined && options.stockLevel <= 0) {
      return ProductLifecycle.OUT_OF_STOCK;
    }

    if (options?.pendingReviewCount !== undefined && options.pendingReviewCount > 0) {
      return ProductLifecycle.PRICE_REVIEW_PENDING;
    }

    return next;
  }

  public static deriveLifecycle(stockLevel: number, hasPendingReviews: boolean): ProductLifecycle {
    if (stockLevel <= 0) {
      return ProductLifecycle.OUT_OF_STOCK;
    }
    if (hasPendingReviews) {
      return ProductLifecycle.PRICE_REVIEW_PENDING;
    }
    return ProductLifecycle.ACTIVE;
  }
}

export class SuggestionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<SuggestionStatus, SuggestionStatus[]> = {
    [SuggestionStatus.PENDING]: [SuggestionStatus.ACCEPTED, SuggestionStatus.REJECTED],
    [SuggestionStatus.ACCEPTED]: [], // Terminal
    [SuggestionStatus.REJECTED]: [], // Terminal
  };

  public static canTransition(current: SuggestionStatus, next: SuggestionStatus): boolean {
    return this.VALID_TRANSITIONS[current]?.includes(next) ?? false;
  }

  public static validateTransition(current: SuggestionStatus, next: SuggestionStatus): void {
    if (!this.canTransition(current, next)) {
      throw new InvalidStateTransitionError(
        'Suggestion',
        current,
        next,
        current === next ? 'Suggestion is already resolved.' : 'Final states (ACCEPTED, REJECTED) cannot be modified.'
      );
    }
  }
}
