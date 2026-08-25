import React, { useState } from 'react';
import { ProductCategory } from '../types/index.js';
import { X, Plus, Sparkles, Layers } from 'lucide-react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (data: any) => Promise<void>;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onCreateProduct,
}) => {
  if (!isOpen) return null;

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('ELECTRONICS');
  const [currentPrice, setCurrentPrice] = useState('49.99');
  const [stockLevel, setStockLevel] = useState('20');
  const [reorderThreshold, setReorderThreshold] = useState('10');
  const [costPrice, setCostPrice] = useState('25.00');
  const [supplierId, setSupplierId] = useState('SUP-GLOBAL-01');
  const [marginFloor, setMarginFloor] = useState('0.20');
  const [competitorPrice, setCompetitorPrice] = useState('54.99');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;

    setSubmitting(true);
    try {
      await onCreateProduct({
        sku,
        name,
        category,
        currentPrice: parseFloat(currentPrice),
        stockLevel: parseInt(stockLevel, 10),
        reorderThreshold: parseInt(reorderThreshold, 10),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        supplierId: supplierId || undefined,
        marginFloor: marginFloor ? parseFloat(marginFloor) : undefined,
        competitorPrice: competitorPrice ? parseFloat(competitorPrice) : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              Create New Product SKU
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Add a new SKU to ShopStream catalog with reactive trigger thresholds.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                SKU (Unique) *
              </label>
              <input
                type="text"
                required
                placeholder="SKU-EL-999"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ultra Ergonomic Office Chair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              >
                <option value="ELECTRONICS">ELECTRONICS</option>
                <option value="APPAREL">APPAREL</option>
                <option value="HOME">HOME</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Initial Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Initial Stock Units *
              </label>
              <input
                type="number"
                required
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Reorder Trigger Threshold (Units) *
            </label>
            <input
              type="number"
              required
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                color: '#f8fafc',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* Sprint 2 Architecture Section */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginTop: '6px',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} />
              Sprint 2 Extension Fields (Optional)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  Unit Cost Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  Supplier ID
                </label>
                <input
                  type="text"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              <Plus size={15} />
              {submitting ? 'Creating...' : 'Create SKU'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
