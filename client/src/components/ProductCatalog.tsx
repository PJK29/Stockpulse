import React, { useState } from 'react';
import { Product, ProductCategory, ProductLifecycle } from '../types/index.js';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Flame, 
  ArrowDownToLine, 
  Sparkles, 
  Plus, 
  Eye, 
  TrendingUp, 
  Package, 
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onSimulateSale: (productId: string, quantity: number) => Promise<void>;
  onUpdateStock: (productId: string, stockLevel: number) => Promise<void>;
  onRequestPricing: (productId: string) => Promise<void>;
  onRequestReorder: (productId: string) => Promise<void>;
  onSelectProduct: (product: Product) => void;
  onOpenCreateModal: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSimulateSale,
  onUpdateStock,
  onRequestPricing,
  onRequestReorder,
  onSelectProduct,
  onOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ProductLifecycle | 'ALL'>('ALL');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.lifecycle === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSimulate = async (productId: string, actionName: string, fn: () => Promise<void>) => {
    setActionInProgress(`${productId}-${actionName}`);
    try {
      await fn();
    } finally {
      setActionInProgress(null);
    }
  };

  const renderLifecycleBadge = (lifecycle: ProductLifecycle) => {
    switch (lifecycle) {
      case 'ACTIVE':
        return <span className="badge badge-active">Active</span>;
      case 'PRICE_REVIEW_PENDING':
        return <span className="badge badge-review">Review Pending</span>;
      case 'OUT_OF_STOCK':
        return <span className="badge badge-oos">Out of Stock</span>;
    }
  };

  return (
    <section className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Header & Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Live Inventory Catalog & Signal Monitor
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time stock depletion gauges, 24-hour demand velocity trackers, and event simulation dispatchers.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Plus size={16} />
          <span>New Product SKU</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        background: 'var(--bg-secondary)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          flex: '1',
          minWidth: '220px',
        }}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search SKU or product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.825rem',
              width: '100%',
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Category:</span>
          {(['ALL', 'ELECTRONICS', 'APPAREL', 'HOME'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: categoryFilter === cat ? 'var(--accent-primary)' : 'transparent',
                border: categoryFilter === cat ? 'none' : '1px solid var(--border-subtle)',
                color: categoryFilter === cat ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Status:</span>
          {(['ALL', 'ACTIVE', 'PRICE_REVIEW_PENDING', 'OUT_OF_STOCK'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: statusFilter === st ? 'var(--accent-primary)' : 'transparent',
                border: statusFilter === st ? 'none' : '1px solid var(--border-subtle)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {st === 'ALL' ? 'All Statuses' : st === 'PRICE_REVIEW_PENDING' ? 'Review Pending' : st === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Active'}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 14px' }}>SKU / Product Name</th>
              <th style={{ padding: '12px 14px' }}>Category</th>
              <th style={{ padding: '12px 14px' }}>Price</th>
              <th style={{ padding: '12px 14px' }}>Stock / Threshold</th>
              <th style={{ padding: '12px 14px' }}>24h Velocity</th>
              <th style={{ padding: '12px 14px' }}>Lifecycle</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Interactive Simulations</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const isBelowThreshold = product.stockLevel <= product.reorderThreshold;
              const isHighVelocity = product.demandVelocity >= 5;
              const stockRatio = Math.min(100, (product.stockLevel / (product.reorderThreshold * 2)) * 100);

              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  
                  {/* SKU & Name */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{product.name}</span>
                      {product.sku === 'SKU-EL-101' && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                          DEMO SKU
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                      <span>{product.sku}</span>
                      {product.costPrice && <span>• Cost: ${product.costPrice.toFixed(2)}</span>}
                      {product.supplierId && <span>• Supp: {product.supplierId}</span>}
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: 'var(--bg-tertiary)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                      ${product.currentPrice.toFixed(2)}
                    </div>
                    {product.competitorPrice && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Comp: ${product.competitorPrice.toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Stock & Gauge */}
                  <td style={{ padding: '14px', minWidth: '160px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: isBelowThreshold ? '#fbbf24' : '#f8fafc' }}>
                        {product.stockLevel} units
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                        Threshold: {product.reorderThreshold}
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${stockRatio}%`,
                          background: product.stockLevel === 0 ? '#ef4444' : isBelowThreshold ? '#fbbf24' : '#10b981',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </td>

                  {/* Velocity */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isHighVelocity ? <Flame size={14} color="#fb7185" /> : <TrendingUp size={14} color="#64748b" />}
                      <span style={{ fontWeight: 700, color: isHighVelocity ? '#fb7185' : '#f8fafc' }}>
                        {product.demandVelocity}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>orders/24h</span>
                    </div>
                  </td>

                  {/* Lifecycle */}
                  <td style={{ padding: '14px' }}>
                    {renderLifecycleBadge(product.lifecycle)}
                  </td>

                  {/* Interactive Simulation Controls */}
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      
                      {/* Sale (+1 Order) */}
                      <button
                        onClick={() => handleSimulate(product.id, 'sale', () => onSimulateSale(product.id, 1))}
                        disabled={product.stockLevel <= 0 || actionInProgress === `${product.id}-sale`}
                        className="btn btn-secondary btn-sm"
                        title="Simulate 1 sales order (decrements stock, increases velocity)"
                      >
                        <ShoppingCart size={13} color="#38bdf8" />
                        <span>+1 Sale</span>
                      </button>

                      {/* Flash Spike (+6 Orders) */}
                      <button
                        onClick={() => handleSimulate(product.id, 'spike', () => onSimulateSale(product.id, 6))}
                        disabled={product.stockLevel <= 0 || actionInProgress === `${product.id}-spike`}
                        className="btn btn-secondary btn-sm"
                        style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }}
                        title="Simulate Flash Sale surge of 6 orders (triggers DEMAND_SPIKE loop!)"
                      >
                        <Flame size={13} color="#fb7185" />
                        <span>Spike +6</span>
                      </button>

                      {/* Drain Stock near threshold */}
                      <button
                        onClick={() => handleSimulate(product.id, 'deplete', () => onUpdateStock(product.id, Math.max(1, product.reorderThreshold - 2)))}
                        disabled={actionInProgress === `${product.id}-deplete`}
                        className="btn btn-secondary btn-sm"
                        style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}
                        title="Deplete stock below threshold (triggers INVENTORY_LOW loop!)"
                      >
                        <ArrowDownToLine size={13} color="#fbbf24" />
                        <span>Drain</span>
                      </button>

                      {/* On-demand Advisor */}
                      <button
                        onClick={() => handleSimulate(product.id, 'advisor', () => onRequestPricing(product.id))}
                        disabled={actionInProgress === `${product.id}-advisor`}
                        className="btn btn-secondary btn-sm"
                        style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc' }}
                        title="Request on-demand AI pricing evaluation"
                      >
                        <Sparkles size={13} color="#c084fc" />
                        <span>Advise</span>
                      </button>

                      {/* Details Modal */}
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="btn btn-secondary btn-icon btn-sm"
                        title="View product history and snapshots"
                      >
                        <Eye size={14} color="#94a3b8" />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </section>
  );
};
