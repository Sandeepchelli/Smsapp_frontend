import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, ArrowLeft, Calendar, Shield } from 'lucide-react';

export default function AppLayout({
  activeNav,
  onSelectNav,
  title,
  subtitle,
  badgeCounts,
  actions,
  children
}) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="app-container">
      {/* Left-Side Vertical Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={onSelectNav}
        badgeCounts={badgeCounts}
      />

      {/* Main Content Viewport */}
      <div className="main-viewport">
        {/* Top Header Bar */}
        <header className="viewport-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {activeNav !== 'dashboard' && (
              <button
                type="button"
                onClick={() => onSelectNav('dashboard')}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                title="Back to Dashboard"
              >
                <ArrowLeft size={15} />
                <span>Dashboard</span>
              </button>
            )}

            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {title || 'Dashboard'}
              </h2>
              {subtitle && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: 'var(--text-dim)',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Calendar size={14} color="var(--primary-light)" />
              <span>{today}</span>
            </div>

            {actions && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Single-Module Main Slot */}
        <main className="viewport-content">
          {children}
        </main>
      </div>
    </div>
  );
}
