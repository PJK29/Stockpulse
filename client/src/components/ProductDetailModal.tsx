import React, { useState } from 'react';
import { Product } from '../types/index.js';
import { 
  X, 
  Package, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  ExternalLink, 
  History,
  Sparkles
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdateStock: (productId: string, stockLevel: number) => Promise<void>;
  onRequestPricing: (productId: string) => Promise<void>;
  onRequestReorder: (productId: string) => Promise<void>;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onUpdateStock,
  onRequestPricing,
  onRequestReorder,
}) => {
  if (!product) return null;

  const [editStock, setEditStock] = useState(product.stockLevel.toString());
  const [updating, setUpdating] = useState(false);

  const handleStockSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(editStock, 10);
    if (isNaN(val) || val < 0) return;
    setUpdating(true);
    try {
      await onUpdateStock(product.id, val);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-initial">{product.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {product.sku}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
              {product.name}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Core Attributes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          background: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Retail Price
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              ${product.currentPrice.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              On-Hand Stock
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: product.stockLevel <= product.reorderThreshold ? '#fbbf24' : '#f8fafc', marginTop: '2px' }}>
              {product.stockLevel} units
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Reorder Threshold
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '2px' }}>
              {product.reorderThreshold} units
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              24h Velocity
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: product.demandVelocity >= 5 ? '#fb7185' : '#f8fafc', marginTop: '2px' }}>
              {product.demandVelocity} orders
            </div>
          </div>
        </div>

        {/* Sprint 2 Extension Architecture Box */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            <Layers size={14} />
            <span>Sprint 2 & 3 Extension Architecture Fields</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Cost Price (COGS):</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                {product.costPrice ? `$${product.costPrice.toFixed(2)}` : 'Not configured'}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Margin Floor:</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                {product.marginFloor ? `${(product.marginFloor * 100).toFixed(0)}% minimum` : '15% (default)'}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Supplier ID:</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                {product.supplierId || 'Direct Factory'}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Market Competitor:</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                {product.competitorPrice ? `$${product.competitorPrice.toFixed(2)}` : 'Not indexed'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Inventory Adjustment Form */}
        <form onSubmit={handleStockSave} style={{ marginBottom: '20px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Override Current Stock Level (Triggers Agentic Signal if ≤ Threshold)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              min="0"
              value={editStock}
              onChange={(e) => setEditStock(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                color: '#f8fafc',
                fontSize: '0.9rem',
                width: '120px',
              }}
            />
            <button type="submit" disabled={updating} className="btn btn-primary btn-sm">
              {updating ? 'Updating...' : 'Set Stock'}
            </button>
          </div>
        </form>

        {/* Manual Triggers */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => onRequestPricing(product.id)}
            className="btn btn-secondary btn-sm"
            style={{ color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.4)' }}
          >
            <Sparkles size={14} />
            Evaluate Pricing
          </button>
          <button
            onClick={() => onRequestReorder(product.id)}
            className="btn btn-secondary btn-sm"
            style={{ color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.4)' }}
          >
            <Package size={14} />
            Evaluate Reorder
          </button>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
