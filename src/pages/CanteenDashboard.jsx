import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import CanteenModule from '../components/CanteenModule';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { UtensilsCrossed, Clock, PlusCircle, Layers, ShoppingBag } from 'lucide-react';

export default function CanteenDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'menu', 'add-food', 'orders', 'management', 'profile', 'settings'

  const navTitles = {
    dashboard: 'Canteen Dashboard',
    menu: 'Food Menu & Orders',
    'add-food': 'Add Food Item',
    orders: 'Incoming Orders',
    management: 'Order Management',
    profile: 'Staff Profile',
    settings: 'Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Canteen'}
      subtitle={`Welcome, ${user?.name} • College Food & Catering Desk`}
      badgeCounts={{}}
    >
      {/* DASHBOARD OVERVIEW */}
      {activeNav === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="stat-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <UtensilsCrossed size={26} />
              </div>
              <div>
                <div className="stat-label">Canteen Desk</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>Staff Portal</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Live Food Orders & Menu
                </div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Clock size={26} />
              </div>
              <div>
                <div className="stat-label">Order Operations</div>
                <div className="stat-value" style={{ color: '#34d399' }}>Active</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Campus Food Service
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#fff' }}>Quick Canteen Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                ['orders', 'Incoming Orders'],
                ['menu', 'Manage Food Menu'],
                ['profile', 'Staff Profile'],
                ['settings', 'Settings']
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveNav(id)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', borderRadius: '10px', fontSize: '0.85rem' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CANTEEN OPERATIONAL MODULE */}
      {(activeNav === 'orders' || activeNav === 'menu' || activeNav === 'add-food' || activeNav === 'management') && (
        <CanteenModule mode="staff" />
      )}

      {/* PROFILE VIEW */}
      {activeNav === 'profile' && <ProfilePage />}

      {/* SETTINGS VIEW */}
      {activeNav === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}
