import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 9999,
      maxWidth: '420px',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-in"
          style={{
            background: '#111726',
            border: `1px solid ${
              toast.type === 'success'
                ? '#10b981'
                : toast.type === 'warning'
                ? '#fbbf24'
                : '#6366f1'
            }`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toast.type === 'success' && <CheckCircle size={18} color="#10b981" />}
            {toast.type === 'warning' && <AlertCircle size={18} color="#fbbf24" />}
            {toast.type === 'info' && <Info size={18} color="#818cf8" />}
            <span style={{ fontSize: '0.825rem', color: '#f8fafc', fontWeight: 500 }}>
              {toast.message}
            </span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
