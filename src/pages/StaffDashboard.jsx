import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import {
  User, Settings, CheckSquare,
  Car, Shield, UserCog, Briefcase, Sparkles, Wrench,
  Calendar, CheckCircle2, XCircle, AlertCircle, MinusCircle
} from 'lucide-react';

const ROLE_META = {
  Driver: {
    label: 'Driver', color: '#3b82f6', bg: 'rgba(59,130,246,0.13)',
    icon: Car, dept: 'Transport Department', desc: 'College Transport & Fleet Management'
  },
  Watchman: {
    label: 'Security / Watchman', color: '#f59e0b', bg: 'rgba(245,158,11,0.13)',
    icon: Shield, dept: 'Security Department', desc: 'Campus Security & Access Control'
  },
  Attender: {
    label: 'Attender', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)',
    icon: UserCog, dept: 'Academic Support', desc: 'Lab & Floor Attender'
  },
  Attendant: {
    label: 'Attendant', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)',
    icon: UserCog, dept: 'Academic Support', desc: 'Lab & Classroom Attendant'
  },
  'Lab Technician': {
    label: 'Lab Technician', color: '#10b981', bg: 'rgba(16,185,129,0.13)',
    icon: Wrench, dept: 'Laboratories', desc: 'Computer & Science Laboratories Technical Support'
  },
  OfficeStaff: {
    label: 'Office Staff', color: '#06b6d4', bg: 'rgba(6,182,212,0.13)',
    icon: Briefcase, dept: 'Administration', desc: 'Office & Administrative Support'
  },
  Cleaner: {
    label: 'Cleaner / Housekeeping', color: '#10b981', bg: 'rgba(16,185,129,0.13)',
    icon: Sparkles, dept: 'Housekeeping', desc: 'Campus Sanitation & Housekeeping'
  },
  Other: {
    label: 'Staff', color: '#64748b', bg: 'rgba(100,116,139,0.13)',
    icon: Wrench, dept: 'General Staff', desc: 'College Support Staff'
  }
};

const STATUS_CONFIG = {
  Present:    { color: '#34d399', bg: 'rgba(52,211,153,0.13)',   icon: CheckCircle2, label: 'Present'  },
  Absent:     { color: '#f87171', bg: 'rgba(248,113,113,0.13)',  icon: XCircle,      label: 'Absent'   },
  Leave:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.13)',   icon: AlertCircle,  label: 'Leave'    },
  'Half-Day': { color: '#94a3b8', bg: 'rgba(148,163,184,0.13)', icon: MinusCircle,  label: 'Half-Day' }
};

export default function StaffDashboard() {
  const { user, token } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, leave: 0, halfDay: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const role = user?.role || 'Other';
  const meta = ROLE_META[role] || ROLE_META.Other;
  const RoleIcon = meta.icon;

  const fetchAttendance = async (month) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/me/attendance?month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
        setSummary(data.summary || { total: 0, present: 0, absent: 0, leave: 0, halfDay: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(selectedMonth); }, [selectedMonth]);

  const navTitles = {
    dashboard: `${meta.label} Dashboard`,
    attendance: 'My Attendance',
    profile: 'My Profile',
    settings: 'Settings'
  };

  const attendancePercent = summary.total > 0
    ? Math.round((summary.present / summary.total) * 100)
    : 0;

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Dashboard'}
      subtitle={`Welcome, ${user?.name} \u2022 ${meta.desc}`}
      badgeCounts={{}}
    >
      {/* ─────────────────────── DASHBOARD ─────────────────────── */}
      {activeNav === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Welcome Hero Card */}
          <div className="glass-panel" style={{
            padding: '28px', borderRadius: '18px',
            background: `linear-gradient(135deg, ${meta.bg}, rgba(255,255,255,0.03))`,
            border: `1px solid ${meta.color}30`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: meta.bg, border: `2px solid ${meta.color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <RoleIcon size={34} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: meta.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {meta.dept}
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>{user?.name}</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>
                  {user?.post}
                  {user?.employee_id && <span style={{ color: 'var(--text-dim)', marginLeft: '10px' }}>ID: {user.employee_id}</span>}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Login ID: <span style={{ color: '#c4b5fd', fontWeight: 700 }}>{user?.username}</span>
                  {user?.phone && <span style={{ marginLeft: '14px' }}>📞 {user.phone}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px' }}>This Month</div>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, lineHeight: 1,
                  color: attendancePercent >= 75 ? '#34d399' : attendancePercent >= 50 ? '#fbbf24' : '#f87171'
                }}>
                  {attendancePercent}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {summary.present}/{summary.total} days present
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stat-grid">
            {[
              { label: 'Present', value: summary.present, color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: CheckCircle2 },
              { label: 'Absent',  value: summary.absent,  color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: XCircle },
              { label: 'On Leave', value: summary.leave,  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  icon: AlertCircle },
              { label: 'Half-Day', value: summary.halfDay,color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',icon: MinusCircle }
            ].map(s => {
              const Ico = s.icon;
              return (
                <div key={s.label} className="glass-panel stat-card" style={{ borderTop: `3px solid ${s.color}40` }}>
                  <div className="stat-icon-box" style={{ background: s.bg, color: s.color }}>
                    <Ico size={22} />
                  </div>
                  <div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>This Month</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'attendance', label: 'My Attendance', Icon: CheckSquare },
                { id: 'profile', label: 'My Profile', Icon: User },
                { id: 'settings', label: 'Settings', Icon: Settings }
              ].map(({ id, label, Icon }) => (
                <button key={id} type="button" onClick={() => setActiveNav(id)} className="btn btn-secondary"
                  style={{ borderRadius: '10px', gap: '8px' }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── MY ATTENDANCE ─────────────────────── */}
      {activeNav === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Filter Header */}
          <div className="glass-panel" style={{
            padding: '20px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>My Attendance Record</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Monthly attendance history</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="var(--primary-light)" />
              <input
                type="month" value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="form-input" style={{ width: '160px', padding: '8px 12px' }}
              />
            </div>
          </div>

          {/* Monthly Summary Mini Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '12px' }}>
            {[
              { label: 'Total Days', value: summary.total, color: '#c4b5fd' },
              { label: 'Present', value: summary.present, color: '#34d399' },
              { label: 'Absent', value: summary.absent, color: '#f87171' },
              { label: 'On Leave', value: summary.leave, color: '#fbbf24' },
              { label: 'Half-Day', value: summary.halfDay, color: '#94a3b8' },
              { label: 'Attendance %', value: `${attendancePercent}%`, color: attendancePercent >= 75 ? '#34d399' : '#f87171' }
            ].map(s => (
              <div key={s.label} className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Attendance Records Table */}
          <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Date', 'Day', 'Status', 'Remarks', 'Marked By'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem',
                      color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No attendance records for {selectedMonth}
                  </td></tr>
                ) : attendance.map(rec => {
                  const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.Present;
                  const StatusIco = cfg.icon;
                  const d = new Date(rec.date + 'T00:00:00');
                  return (
                    <tr key={rec.id}
                      style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>{rec.date}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '3px 10px', borderRadius: '99px',
                          background: cfg.bg, color: cfg.color, fontSize: '0.78rem', fontWeight: 700
                        }}>
                          <StatusIco size={12} /> {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{rec.remarks || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>{rec.marked_by_name || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'profile' && <ProfilePage />}
      {activeNav === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}
