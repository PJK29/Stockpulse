import React, { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  PricingSuggestion, 
  ReorderSuggestion, 
  StrategyType 
} from './types/index.js';
import { api } from './services/api.js';
import { Header } from './components/Header.js';
import { KPIMetrics } from './components/KPIMetrics.js';
import { SimulationBanner } from './components/SimulationBanner.js';
import { PendingSuggestionsFeed } from './components/PendingSuggestionsFeed.js';
import { ProductCatalog } from './components/ProductCatalog.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { AuditHistoryModal } from './components/AuditHistoryModal.js';
import { CreateProductModal } from './components/CreateProductModal.js';
import { ToastContainer, ToastMessage } from './components/Toast.js';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pricingSuggestions, setPricingSuggestions] = useState<PricingSuggestion[]>([]);
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>('RULE_BASED');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all state
  const loadData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const [prods, pricing, reorder, engine] = await Promise.all([
        api.getProducts(),
        api.getPricingSuggestions(),
        api.getReorderSuggestions(),
        api.getEngineStatus(),
      ]);

      setProducts(prods);
      setPricingSuggestions(pricing);
      setReorderSuggestions(reorder);
      setActiveStrategy(engine.activeStrategy);

      if (showToast) {
        addToast('State refreshed successfully', 'info');
      }
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and fast live polling
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Strategy Switch
  const handleStrategyChange = async (strategy: StrategyType) => {
    try {
      const res = await api.setEngineStrategy(strategy);
      setActiveStrategy(res.activeStrategy);
      addToast(`Commerce Engine strategy switched to ${res.activeStrategy === 'AI_GEMINI' ? 'Google Gemini AI Advisor' : 'Rule-Based Engine'}`, 'info');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to switch strategy', 'warning');
    }
  };

  // Seed Demo Data
  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await api.seedDemoData();
      addToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to seed demo data', 'warning');
    } finally {
      setSeeding(false);
    }
  };

  // Resolve Pricing Suggestion
  const handleResolvePricing = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await api.resolvePricingSuggestion(id, status);
      addToast(
        status === 'ACCEPTED'
          ? `Accepted price calibration for ${res.product.name} (New Price: $${res.product.currentPrice.toFixed(2)})`
          : `Rejected price suggestion for ${res.product.name}`,
        status === 'ACCEPTED' ? 'success' : 'info'
      );
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to resolve pricing suggestion', 'warning');
    }
  };

  // Resolve Reorder Suggestion
  const handleResolveReorder = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await api.resolveReorderSuggestion(id, status);
      addToast(
        status === 'ACCEPTED'
          ? `Approved inbound replenishment shipment for ${res.product.name} (Stock: ${res.product.stockLevel} units)`
          : `Rejected reorder suggestion for ${res.product.name}`,
        status === 'ACCEPTED' ? 'success' : 'info'
      );
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to resolve reorder suggestion', 'warning');
    }
  };

  // Simulate Sale
  const handleSimulateSale = async (productId: string, quantity: number) => {
    try {
      const res = await api.simulateOrder(productId, quantity);
      const triggerMsg = res.triggerReason ? ` -> Fired ${res.triggerReason} recommendation loop!` : '';
      addToast(`Simulated sale of ${quantity} unit(s) on ${res.product.name} (Stock: ${res.product.stockLevel})${triggerMsg}`, res.triggerReason ? 'warning' : 'success');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to simulate sale', 'warning');
    }
  };

  // Update Stock
  const handleUpdateStock = async (productId: string, stockLevel: number) => {
    try {
      const updated = await api.updateStock(productId, stockLevel);
      addToast(`Updated stock for ${updated.name} to ${updated.stockLevel} units`, 'info');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update stock', 'warning');
    }
  };

  // On-demand Suggestions
  const handleRequestPricing = async (productId: string) => {
    try {
      const res = await api.requestPricingSuggestion(productId);
      addToast('Generated on-demand AI pricing recommendation', 'info');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to request pricing', 'warning');
    }
  };

  const handleRequestReorder = async (productId: string) => {
    try {
      const res = await api.requestReorderSuggestion(productId);
      addToast('Generated on-demand replenishment recommendation', 'info');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to request reorder', 'warning');
    }
  };

  // Create Product
  const handleCreateProduct = async (data: any) => {
    try {
      const newProd = await api.createProduct(data);
      addToast(`Created SKU ${newProd.sku} (${newProd.name})`, 'success');
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to create product', 'warning');
    }
  };

  // Guided Scenarios
  const triggerScenarioA = async () => {
    const demoProduct = products.find((p) => p.sku === 'SKU-EL-101');
    if (!demoProduct) {
      addToast('Demo SKU-EL-101 not found. Please click "Reset Demo Data".', 'warning');
      return;
    }
    // Drain below threshold (Threshold is 10, set to 8)
    await handleUpdateStock(demoProduct.id, 8);
    addToast('Demo Path Activated: Aura Pro Headphones depleted to 8 units (<10 threshold). Agentic recommendation loop queued!', 'warning');
  };

  const triggerScenarioB = async () => {
    const hoodie = products.find((p) => p.sku === 'SKU-AP-201');
    if (!hoodie) {
      addToast('Apparel SKU-AP-201 not found. Please click "Reset Demo Data".', 'warning');
      return;
    }
    await handleSimulateSale(hoodie.id, 8);
    addToast('Flash Sale Spike Activated: 8 units sold rapidly on Merino Wool Hoodie. Demand surge recommendation queued!', 'warning');
  };

  const triggerScenarioC = async () => {
    const monitor = products.find((p) => p.sku === 'SKU-EL-102');
    if (!monitor) {
      addToast('Monitor SKU-EL-102 not found. Please click "Reset Demo Data".', 'warning');
      return;
    }
    await handleUpdateStock(monitor.id, 0);
    addToast('Critical Depletion Activated: Gaming Monitor stock drained to 0. Lifecycle set to OUT_OF_STOCK and replenishment queued!', 'warning');
  };

  return (
    <div className="app-container">
      
      {/* Top Header */}
      <Header
        activeStrategy={activeStrategy}
        onStrategyChange={handleStrategyChange}
        onSeedData={handleSeedData}
        onRefresh={() => loadData(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        loading={loading}
        seeding={seeding}
      />

      {/* 1-Click Interactive Demo Simulation Bar */}
      <SimulationBanner
        onTriggerScenarioA={triggerScenarioA}
        onTriggerScenarioB={triggerScenarioB}
        onTriggerScenarioC={triggerScenarioC}
        onSeedData={handleSeedData}
        loading={loading || seeding}
      />

      {/* KPI Overview Bar */}
      <KPIMetrics
        products={products}
        pricingSuggestions={pricingSuggestions}
        reorderSuggestions={reorderSuggestions}
      />

      {/* Pending Merchandising Approval Queue */}
      <PendingSuggestionsFeed
        pricingSuggestions={pricingSuggestions}
        reorderSuggestions={reorderSuggestions}
        onResolvePricing={handleResolvePricing}
        onResolveReorder={handleResolveReorder}
      />

      {/* Live Inventory Catalog & Signal Monitor */}
      <ProductCatalog
        products={products}
        onSimulateSale={handleSimulateSale}
        onUpdateStock={handleUpdateStock}
        onRequestPricing={handleRequestPricing}
        onRequestReorder={handleRequestReorder}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdateStock={handleUpdateStock}
        onRequestPricing={handleRequestPricing}
        onRequestReorder={handleRequestReorder}
      />

      <AuditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        pricingSuggestions={pricingSuggestions}
        reorderSuggestions={reorderSuggestions}
      />

      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateProduct={handleCreateProduct}
      />

      {/* Interactive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
};

export default App;
