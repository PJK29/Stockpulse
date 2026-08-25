import React from 'react';
import { Product, PricingSuggestion, ReorderSuggestion } from '../types/index.js';
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  Boxes, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface KPIMetricsProps {
  products: Product[];
  pricingSuggestions: PricingSuggestion[];
  reorderSuggestions: ReorderSuggestion[];
}

export const KPIMetrics: React.FC<KPIMetricsProps> = ({
  products,
  pricingSuggestions,
  reorderSuggestions,
}) => {
  const pendingPricing = pricingSuggestions.filter((s) => s.status === 'PENDING').length;
  const pendingReorder = reorderSuggestions.filter((s) => s.status === 'PENDING').length;
  const totalPending = pendingPricing + pendingReorder;

  const lowStockCount = products.filter((p) => p.stockLevel <= p.reorderThreshold).length;
  const outOfStockCount = products.filter((p) => p.stockLevel === 0).length;
  const highVelocityCount = products.filter((p) => p.demandVelocity >= 5).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockLevel, 0);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
    }}>
      
      {/* Metric 1: Pending Approvals */}
      <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Action Required
          </span>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '6px', borderRadius: '8px' }}>
            <Clock size={16} color="#c084fc" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {totalPending}
          </span>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            pending suggestions
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span>Pricing: <strong style={{ color: '#c084fc' }}>{pendingPricing}</strong></span>
          <span>•</span>
          <span>Reorder: <strong style={{ color: '#38bdf8' }}>{pendingReorder}</strong></span>
        </div>
      </div>

      {/* Metric 2: Low Stock Risk */}
      <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Inventory Scarcity
          </span>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '8px' }}>
            <AlertTriangle size={16} color="#fbbf24" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockCount > 0 ? '#fbbf24' : '#f8fafc' }}>
            {lowStockCount}
          </span>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            SKUs below threshold
          </span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {outOfStockCount > 0 ? (
            <span style={{ color: '#f87171', fontWeight: 600 }}>{outOfStockCount} SKUs Out of Stock</span>
          ) : (
            <span style={{ color: '#34d399' }}>0 Out-of-Stock breaches</span>
          )}
        </div>
      </div>

      {/* Metric 3: Demand Velocity Surge */}
      <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demand Spikes
          </span>
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '6px', borderRadius: '8px' }}>
            <Flame size={16} color="#fb7185" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: highVelocityCount > 0 ? '#fb7185' : '#f8fafc' }}>
            {highVelocityCount}
          </span>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            surging items (≥5 ord/24h)
          </span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span>Agentic loop active & monitoring</span>
        </div>
      </div>

      {/* Metric 4: Monitored Catalog */}
      <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Catalog Coverage
          </span>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '6px', borderRadius: '8px' }}>
            <Boxes size={16} color="#38bdf8" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {products.length}
          </span>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            active SKUs ({totalStockUnits} on-hand units)
          </span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#38bdf8' }}>Electronics • Apparel • Home</span>
        </div>
      </div>

    </div>
  );
};
