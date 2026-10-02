import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';
import NotificationDrawer from './NotificationDrawer';
import { School, LogOut, CheckCircle2, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      <header className="glass-panel" style={{
        margin: '16px 24px 0',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <School size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', lineHeight: 1.2 }}>EduSphere</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Smart Attendance & College Portal
              </span>
              <span style={{
                fontSize: '0.7rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '1px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <CheckCircle2 size={11} /> Auto-Detected: {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* User profile & actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(true);
              setUnreadCount(0);
            }}
            className="btn btn-secondary"
            title="Notification Center"
            style={{
              position: 'relative',
              padding: '10px 12px',
              borderRadius: '10px'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>
                {user?.name}
              </span>
              <RoleBadge role={user?.role} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {user?.post} • ID: <code style={{ color: '#cbd5e1' }}>{user?.username}</code>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="btn btn-secondary"
            title="Sign Out"
            style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
