import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, AlertTriangle, FileText, Banknote, 
  X, Check, Clock, ShieldAlert, Sparkles 
} from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, token]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'ABSENCE_ALERT':
        return <ShieldAlert size={20} color="#ef4444" />;
      case 'FEE_UPDATE':
      case 'FEE_PAYMENT':
        return <Banknote size={20} color="#10b981" />;
      case 'LEAVE_STATUS':
      case 'OUTING_STATUS':
      case 'LEAVE_REQUEST':
      case 'OUTING_REQUEST':
        return <FileText size={20} color="#3b82f6" />;
      default:
        return <Bell size={20} color="#818cf8" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        background: '#111827',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
        animation: 'slideLeft 0.25s ease'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Notification Center</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Real-time college updates & alerts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Quick Action */}
        <div style={{
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {notifications.filter(n => !n.is_read).length} unread
          </span>
          <button
            type="button"
            onClick={markAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-light)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check size={14} /> Mark all read
          </button>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              style={{
                background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.08)',
                border: `1px solid ${n.is_read ? 'var(--border-subtle)' : 'rgba(99, 102, 241, 0.3)'}`,
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {!n.is_read && (
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#6366f1'
                }} />
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: n.type === 'ABSENCE_ALERT' ? '#fca5a5' : '#fff',
                    marginBottom: '4px'
                  }}>
                    {n.title}
                  </div>
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.45
                  }}>
                    {n.message}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-dim)',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
              <Bell size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>No notifications right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
