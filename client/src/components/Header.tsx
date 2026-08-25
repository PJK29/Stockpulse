import React from 'react';
import { StrategyType } from '../types/index.js';
import { 
  Zap, 
  Sparkles, 
  RotateCcw, 
  RefreshCw, 
  History, 
  Cpu, 
  ShieldCheck, 
  Sliders
} from 'lucide-react';

interface HeaderProps {
  activeStrategy: StrategyType;
  onStrategyChange: (strategy: StrategyType) => void;
  onSeedData: () => void;
  onRefresh: () => void;
  onOpenHistory: () => void;
  loading: boolean;
  seeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeStrategy,
  onStrategyChange,
  onSeedData,
  onRefresh,
  onOpenHistory,
  loading,
  seeding,
}) => {
  return (
    <header className="glass-panel" style={{ padding: '18px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            padding: '10px',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #f8fafc, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Stockpulse
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '6px',
                padding: '2px 6px',
                letterSpacing: '0.05em'
              }}>
                AUTONOMOUS ADVISOR
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reactive Inventory Signals • AI Dynamic Pricing • Inbound Replenishment Queue
            </p>
          </div>
        </div>

        {/* Action Controls & Strategy Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Runtime Strategy Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            gap: '4px'
          }}>
            <button
              onClick={() => onStrategyChange('RULE_BASED')}
              className={`btn btn-sm ${activeStrategy === 'RULE_BASED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                background: activeStrategy === 'RULE_BASED' ? 'var(--accent-primary)' : 'transparent',
                color: activeStrategy === 'RULE_BASED' ? '#ffffff' : 'var(--text-muted)',
                padding: '6px 12px',
                fontSize: '0.775rem',
              }}
              title="Deterministic inventory elasticity heuristics"
            >
              <Cpu size={14} />
              Rule-Based Engine
            </button>
            <button
              onClick={() => onStrategyChange('AI_GEMINI')}
              className={`btn btn-sm ${activeStrategy === 'AI_GEMINI' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                background: activeStrategy === 'AI_GEMINI' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                color: activeStrategy === 'AI_GEMINI' ? '#ffffff' : 'var(--text-muted)',
                padding: '6px 12px',
                fontSize: '0.775rem',
                boxShadow: activeStrategy === 'AI_GEMINI' ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
              }}
              title="Google Gemini Autonomous LLM Advisor"
            >
              <Sparkles size={14} color={activeStrategy === 'AI_GEMINI' ? '#ffffff' : '#a855f7'} />
              Gemini AI Advisor
            </button>
          </div>

          {/* Audit History Modal Button */}
          <button
            onClick={onOpenHistory}
            className="btn btn-secondary btn-sm"
            title="View resolved suggestions & audit logs"
          >
            <History size={15} color="#94a3b8" />
            <span>Audit History</span>
          </button>

          {/* Seed Addendum A Demo Data */}
          <button
            onClick={onSeedData}
            disabled={seeding}
            className="btn btn-secondary btn-sm"
            title="Reset catalog to Addendum A demo state"
          >
            <RotateCcw size={14} className={seeding ? 'animate-spin' : ''} />
            <span>{seeding ? 'Seeding...' : 'Reset Demo Data'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-secondary btn-icon btn-sm"
            title="Refresh active state"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

      </div>
    </header>
  );
};
