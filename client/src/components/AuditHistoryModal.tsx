import React, { useState } from 'react';
import { PricingSuggestion, ReorderSuggestion } from '../types/index.js';
import { 
  X, 
  History, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Package, 
  Sparkles, 
  Cpu 
} from 'lucide-react';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingSuggestions: PricingSuggestion[];
  reorderSuggestions: ReorderSuggestion[];
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  pricingSuggestions,
  reorderSuggestions,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'ALL' | 'PRICING' | 'REORDER'>('ALL');

  const resolvedPricing = pricingSuggestions.filter((s) => s.status !== 'PENDING');
  const resolvedReorder = reorderSuggestions.filter((s) => s.status !== 'PENDING');

  const totalResolved = resolvedPricing.length + resolvedReorder.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <History size={20} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                Merchandising Audit History & Decisions
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Immutable historical trail of approved calibrations and rejected advisories.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          >
            All Decisions ({totalResolved})
          </button>
          <button
            onClick={() => setActiveTab('PRICING')}
            className={`btn btn-sm ${activeTab === 'PRICING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          >
            Pricing History ({resolvedPricing.length})
          </button>
          <button
            onClick={() => setActiveTab('REORDER')}
            className={`btn btn-sm ${activeTab === 'REORDER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          >
            Replenishment History ({resolvedReorder.length})
          </button>
        </div>

        {/* Empty State */}
        {totalResolved === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No historical approvals or rejections recorded yet.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Accept or reject suggestions in the approval feed to populate this audit ledger.</p>
          </div>
        )}

        {/* Table List */}
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          
          {/* Pricing History */}
          {(activeTab === 'ALL' || activeTab === 'PRICING') &&
            resolvedPricing.map((item) => {
              const isAccepted = item.status === 'ACCEPTED';
              return (
                <div
                  key={`p-${item.id}`}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isAccepted ? (
                      <CheckCircle2 size={20} color="#10b981" />
                    ) : (
                      <XCircle size={20} color="#f43f5e" />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                        {item.product?.name || 'Product'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.product?.sku} • {item.triggerReason} • {item.strategyUsed}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isAccepted ? '#10b981' : 'var(--text-muted)' }}>
                      ${item.currentPrice.toFixed(2)} → ${item.recommendedPrice.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {item.status} at {new Date(item.resolvedAt || item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Reorder History */}
          {(activeTab === 'ALL' || activeTab === 'REORDER') &&
            resolvedReorder.map((item) => {
              const isAccepted = item.status === 'ACCEPTED';
              return (
                <div
                  key={`r-${item.id}`}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isAccepted ? (
                      <CheckCircle2 size={20} color="#10b981" />
                    ) : (
                      <XCircle size={20} color="#f43f5e" />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                        {item.product?.name || 'Product'} (Replenishment)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.product?.sku} • {item.triggerReason} • {item.strategyUsed}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isAccepted ? '#38bdf8' : 'var(--text-muted)' }}>
                      +{item.recommendedQuantity} units ({item.suggestedLeadTimeDays}d lead)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {item.status} at {new Date(item.resolvedAt || item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}

        </div>

      </div>
    </div>
  );
};
