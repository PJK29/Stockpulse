import React, { useState } from 'react';
import { PricingSuggestion, ReorderSuggestion, TriggerReason, StrategyType } from '../types/index.js';
import { 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  PackagePlus, 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  Flame, 
  HandMetal, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface PendingSuggestionsFeedProps {
  pricingSuggestions: PricingSuggestion[];
  reorderSuggestions: ReorderSuggestion[];
  onResolvePricing: (id: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>;
  onResolveReorder: (id: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>;
}

export const PendingSuggestionsFeed: React.FC<PendingSuggestionsFeedProps> = ({
  pricingSuggestions,
  reorderSuggestions,
  onResolvePricing,
  onResolveReorder,
}) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PRICING' | 'REORDER'>('ALL');

  const pendingPricing = pricingSuggestions.filter((s) => s.status === 'PENDING');
  const pendingReorder = reorderSuggestions.filter((s) => s.status === 'PENDING');

  const handlePricingAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setResolvingId(id);
    try {
      await onResolvePricing(id, status);
    } finally {
      setResolvingId(null);
    }
  };

  const handleReorderAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setResolvingId(id);
    try {
      await onResolveReorder(id, status);
    } finally {
      setResolvingId(null);
    }
  };

  const renderTriggerBadge = (reason: TriggerReason) => {
    switch (reason) {
      case 'DEMAND_SPIKE':
        return (
          <span className="badge badge-spike">
            <Flame size={12} />
            Demand Spike
          </span>
        );
      case 'INVENTORY_LOW':
        return (
          <span className="badge badge-low-stock">
            <AlertTriangle size={12} />
            Low Inventory
          </span>
        );
      case 'MANUAL':
        return (
          <span className="badge badge-manual">
            <Zap size={12} />
            Manual Trigger
          </span>
        );
      case 'INITIAL':
      default:
        return (
          <span className="badge badge-initial">
            <Clock size={12} />
            Baseline
          </span>
        );
    }
  };

  const renderStrategyBadge = (strategy: StrategyType) => {
    if (strategy === 'AI_GEMINI') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.7rem',
          fontWeight: 700,
          background: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '999px',
          padding: '2px 8px',
        }}>
          <Sparkles size={11} />
          Gemini AI
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.7rem',
        fontWeight: 700,
        background: 'rgba(99, 102, 241, 0.15)',
        color: '#818cf8',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '999px',
        padding: '2px 8px',
      }}>
        <Cpu size={11} />
        Rule Engine
      </span>
    );
  };

  const totalCount = pendingPricing.length + pendingReorder.length;

  return (
    <section className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      
      {/* Feed Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Merchandising Approval Queue
            </h2>
            <span style={{
              background: totalCount > 0 ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              {totalCount} Pending
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Review and approve AI-generated price calibrations and inbound replenishment purchase recommendations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: activeTab === 'ALL' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'ALL' ? '#ffffff' : 'var(--text-muted)' }}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('PRICING')}
            className={`btn btn-sm ${activeTab === 'PRICING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: activeTab === 'PRICING' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'PRICING' ? '#ffffff' : 'var(--text-muted)' }}
          >
            Pricing ({pendingPricing.length})
          </button>
          <button
            onClick={() => setActiveTab('REORDER')}
            className={`btn btn-sm ${activeTab === 'REORDER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: activeTab === 'REORDER' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'REORDER' ? '#ffffff' : 'var(--text-muted)' }}
          >
            Replenishment ({pendingReorder.length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {totalCount === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}>
            <ShieldCheck size={26} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
            All Suggestions Resolved & Healthy
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '6px auto 0 auto' }}>
            No pending approvals at this time. The agentic loop will automatically detect stock breaches or velocity surges and queue recommendations here.
          </p>
        </div>
      )}

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: '20px',
      }}>

        {/* Pricing Suggestions */}
        {(activeTab === 'ALL' || activeTab === 'PRICING') &&
          pendingPricing.map((suggestion) => {
            const isIncrease = suggestion.recommendedPrice > suggestion.currentPrice;
            const isDecrease = suggestion.recommendedPrice < suggestion.currentPrice;
            const diffAmount = Math.abs(suggestion.recommendedPrice - suggestion.currentPrice);
            const diffPercent = ((diffAmount / suggestion.currentPrice) * 100).toFixed(1);
            const isBusy = resolvingId === suggestion.id;

            return (
              <div
                key={suggestion.id}
                className="glass-panel animate-slide-in"
                style={{
                  padding: '20px',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  background: 'linear-gradient(180deg, rgba(25, 34, 55, 0.9) 0%, rgba(17, 23, 38, 0.95) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                {/* Card Top */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {renderTriggerBadge(suggestion.triggerReason)}
                      {renderStrategyBadge(suggestion.strategyUsed)}
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(suggestion.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                    {suggestion.product?.name || 'Product'}
                  </h3>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{suggestion.product?.sku}</span>
                    <span>•</span>
                    <span>{suggestion.product?.category}</span>
                    <span>•</span>
                    <span>Stock: <strong style={{ color: (suggestion.product?.stockLevel ?? 0) <= (suggestion.product?.reorderThreshold ?? 0) ? '#fbbf24' : '#38bdf8' }}>{suggestion.product?.stockLevel}</strong> / {suggestion.product?.reorderThreshold}</span>
                  </div>

                  {/* Pricing Comparison Box */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-secondary)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '14px',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Current Price
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: isIncrease || isDecrease ? 'line-through' : 'none' }}>
                        ${suggestion.currentPrice.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRight size={16} color="#64748b" />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: isIncrease ? '#34d399' : isDecrease ? '#fbbf24' : '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                        AI Recommended
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isIncrease ? '#34d399' : isDecrease ? '#fbbf24' : '#f8fafc' }}>
                        ${suggestion.recommendedPrice.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <span className={`badge ${isIncrease ? 'badge-increase' : isDecrease ? 'badge-decrease' : 'badge-hold'}`}>
                        {isIncrease && <TrendingUp size={12} />}
                        {isDecrease && <TrendingDown size={12} />}
                        {isIncrease ? `+${diffPercent}%` : isDecrease ? `-${diffPercent}%` : 'HOLD'}
                      </span>
                    </div>
                  </div>

                  {/* Confidence Meter */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Model Confidence</span>
                      <strong style={{ color: '#38bdf8' }}>{(suggestion.confidence * 100).toFixed(0)}%</strong>
                    </div>
                    <div className="confidence-meter">
                      <div className="confidence-bar-bg">
                        <div
                          className="confidence-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(10, suggestion.confidence * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning Block */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderLeft: '3px solid var(--accent-purple)',
                    padding: '10px 12px',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    lineHeight: '1.45',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#c084fc', fontWeight: 600, fontSize: '0.725rem', marginBottom: '4px' }}>
                      <Sparkles size={13} />
                      COMMERCE ADVISOR REASONING
                    </div>
                    {suggestion.reasoning}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => handlePricingAction(suggestion.id, 'REJECTED')}
                    disabled={isBusy}
                    className="btn btn-danger btn-sm"
                  >
                    <X size={15} />
                    Reject
                  </button>
                  <button
                    onClick={() => handlePricingAction(suggestion.id, 'ACCEPTED')}
                    disabled={isBusy}
                    className="btn btn-success btn-sm"
                  >
                    <Check size={15} />
                    Accept Price
                  </button>
                </div>
              </div>
            );
          })}

        {/* Reorder Suggestions */}
        {(activeTab === 'ALL' || activeTab === 'REORDER') &&
          pendingReorder.map((suggestion) => {
            const isBusy = resolvingId === suggestion.id;

            return (
              <div
                key={suggestion.id}
                className="glass-panel animate-slide-in"
                style={{
                  padding: '20px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  background: 'linear-gradient(180deg, rgba(25, 34, 55, 0.9) 0%, rgba(17, 23, 38, 0.95) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                {/* Card Top */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                        <PackagePlus size={12} />
                        Replenishment Order
                      </span>
                      {renderTriggerBadge(suggestion.triggerReason)}
                      {renderStrategyBadge(suggestion.strategyUsed)}
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(suggestion.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                    {suggestion.product?.name || 'Product'}
                  </h3>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{suggestion.product?.sku}</span>
                    <span>•</span>
                    <span>{suggestion.product?.category}</span>
                    <span>•</span>
                    <span>Current Stock: <strong style={{ color: suggestion.currentStock <= (suggestion.product?.reorderThreshold ?? 0) ? '#fbbf24' : '#38bdf8' }}>{suggestion.currentStock} units</strong></span>
                  </div>

                  {/* Reorder Recommendation Box */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-secondary)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '14px',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Reorder Batch
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                        +{suggestion.recommendedQuantity} units
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Est. Lead Time
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                        {suggestion.suggestedLeadTimeDays} days
                      </div>
                    </div>
                  </div>

                  {/* Confidence Meter */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Replenishment Confidence</span>
                      <strong style={{ color: '#38bdf8' }}>{(suggestion.confidence * 100).toFixed(0)}%</strong>
                    </div>
                    <div className="confidence-meter">
                      <div className="confidence-bar-bg">
                        <div
                          className="confidence-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(10, suggestion.confidence * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning Block */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderLeft: '3px solid var(--accent-cyan)',
                    padding: '10px 12px',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    lineHeight: '1.45',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8', fontWeight: 600, fontSize: '0.725rem', marginBottom: '4px' }}>
                      <Sparkles size={13} />
                      REPLENISHMENT ADVISOR REASONING
                    </div>
                    {suggestion.reasoning}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => handleReorderAction(suggestion.id, 'REJECTED')}
                    disabled={isBusy}
                    className="btn btn-danger btn-sm"
                  >
                    <X size={15} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleReorderAction(suggestion.id, 'ACCEPTED')}
                    disabled={isBusy}
                    className="btn btn-success btn-sm"
                  >
                    <Check size={15} />
                    Approve Inbound
                  </button>
                </div>
              </div>
            );
          })}

      </div>
    </section>
  );
};
