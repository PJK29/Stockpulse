import React from 'react';
import { 
  Play, 
  Flame, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  HelpCircle,
  Zap
} from 'lucide-react';

interface SimulationBannerProps {
  onTriggerScenarioA: () => void; // Deplete near threshold (SKU-EL-101)
  onTriggerScenarioB: () => void; // Demand spike (+8 sales on SKU-AP-201)
  onTriggerScenarioC: () => void; // Out of stock breach
  onSeedData: () => void;
  loading: boolean;
}

export const SimulationBanner: React.FC<SimulationBannerProps> = ({
  onTriggerScenarioA,
  onTriggerScenarioB,
  onTriggerScenarioC,
  onSeedData,
  loading,
}) => {
  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      marginBottom: '28px',
      background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(168, 85, 247, 0.1) 100%)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.2)',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={20} color="#818cf8" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
              Autonomous Demo Scenarios
            </span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              1-CLICK TESTING
            </span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Simulate real-time retail signals to test the reactive AI recommendation loop without manual spreadsheet work.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        
        {/* Scenario A: Deplete near threshold (Demo SKU) */}
        <button
          onClick={onTriggerScenarioA}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
          title="Drain Aura Pro Headphones below threshold (triggers INVENTORY_LOW)"
        >
          <AlertTriangle size={14} color="#fbbf24" />
          <span>Demo Path: Low Stock (SKU-EL-101)</span>
        </button>

        {/* Scenario B: Flash Sale Surge */}
        <button
          onClick={onTriggerScenarioB}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          title="Simulate flash sale of 8 units on Hoodie (triggers DEMAND_SPIKE)"
        >
          <Flame size={14} color="#fb7185" />
          <span>Flash Sale Spike (SKU-AP-201)</span>
        </button>

        {/* Scenario C: Critical Out of Stock */}
        <button
          onClick={onTriggerScenarioC}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          title="Drain Gaming Monitor to 0 units (triggers OUT_OF_STOCK lifecycle & reorder)"
        >
          <Zap size={14} color="#f87171" />
          <span>Drain to Zero (SKU-EL-102)</span>
        </button>

      </div>

    </div>
  );
};
