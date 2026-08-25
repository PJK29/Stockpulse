import {
  Product,
  PricingSuggestion,
  ReorderSuggestion,
  EngineStatus,
  ProductCategory,
  ProductLifecycle,
  SuggestionStatus,
  StrategyType,
} from '../types/index.js';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Products
  async getProducts(filters?: {
    category?: ProductCategory | 'ALL';
    status?: ProductLifecycle | 'ALL';
    search?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    return handleResponse<Product[]>(res);
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse<Product>(res);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  async updateStock(id: string, stockLevel: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockLevel }),
    });
    return handleResponse<Product>(res);
  },

  async simulateOrder(id: string, quantity: number = 1): Promise<{
    order: any;
    product: Product;
    triggerReason: string | null;
    loopDispatched: boolean;
  }> {
    const res = await fetch(`${API_BASE}/products/${id}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(res);
  },

  async requestPricingSuggestion(productId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/products/${productId}/suggest-pricing`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async requestReorderSuggestion(productId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/products/${productId}/suggest-reorder`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Pricing Suggestions
  async getPricingSuggestions(status?: SuggestionStatus): Promise<PricingSuggestion[]> {
    const url = status ? `${API_BASE}/pricing-suggestions?status=${status}` : `${API_BASE}/pricing-suggestions`;
    const res = await fetch(url);
    return handleResponse<PricingSuggestion[]>(res);
  },

  async resolvePricingSuggestion(id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{
    suggestion: PricingSuggestion;
    product: Product;
  }> {
    const res = await fetch(`${API_BASE}/pricing-suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Reorder Suggestions
  async getReorderSuggestions(status?: SuggestionStatus): Promise<ReorderSuggestion[]> {
    const url = status ? `${API_BASE}/reorder-suggestions?status=${status}` : `${API_BASE}/reorder-suggestions`;
    const res = await fetch(url);
    return handleResponse<ReorderSuggestion[]>(res);
  },

  async resolveReorderSuggestion(id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{
    suggestion: ReorderSuggestion;
    product: Product;
  }> {
    const res = await fetch(`${API_BASE}/reorder-suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Engine Strategy
  async getEngineStatus(): Promise<EngineStatus> {
    const res = await fetch(`${API_BASE}/engine/strategy`);
    return handleResponse<EngineStatus>(res);
  },

  async setEngineStrategy(strategy: StrategyType): Promise<{ message: string; activeStrategy: StrategyType }> {
    const res = await fetch(`${API_BASE}/engine/strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy }),
    });
    return handleResponse(res);
  },

  // Demo Seed
  async seedDemoData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
