import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Calendar, Filter, RefreshCw, Save,
  CheckCircle2, XCircle, AlertCircle, MinusCircle,
  Users, TrendingUp, BarChart3, Search, Edit3
} from 'lucide-react';

const STATUS_OPTIONS = ['Present', 'Absent', 'Leave', 'Half-Day'];
const STAFF_ROLES_FILTER = ['All', 'Driver', 'Watchman', 'Attender', 'Attendant', 'Lab Technician', 'OfficeStaff', 'Cleaner', 'Other', 'Canteen', 'Cashier', 'Librarian'];

const STATUS_CONFIG = {
  Present:    { color: '#34d399', bg: 'rgba(52,211,153,0.12)',   icon: CheckCircle2 },
  Absent:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)',  icon: XCircle      },
  Leave:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   icon: AlertCircle  },
  'Half-Day': { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: MinusCircle  }
};

export default function StaffAttendanceModule({ token }) {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'view' | 'monthly'
  const [allStaff, setAllStaff] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { staffId: { status, remarks } }
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('success');

  // View tab
  const [viewDate, setViewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewRole, setViewRole] = useState('All');
  const [viewRecords, setViewRecords] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Monthly tab
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const notify = (msg, type = 'success') => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Fetch all staff list
  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      let url = '/api/admin/staff';
      if (roleFilter !== 'All') url += `?role=${encodeURIComponent(roleFilter)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAllStaff(data.staff || []);
      }
    } catch (err) {
      notify('Failed to load staff: ' + err.message, 'error');
    } finally {
      setLoadingStaff(false);
    }
  };

  // Fetch existing attendance for selected date (to pre-fill)
  const fetchAttendanceForDate = async (date) => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/admin/staff-attendance?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (data.attendance || []).forEach(r => {
          map[r.staff_id] = { status: r.status, remarks: r.remarks || '', id: r.id };
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [roleFilter]);
  useEffect(() => { if (activeTab === 'mark') fetchAttendanceForDate(selectedDate); }, [selectedDate, activeTab]);

  // Fetch view tab records
  const fetchViewRecords = async () => {
    setViewLoading(true);
    try {
      let url = `/api/admin/staff-attendance?date=${viewDate}`;
      if (viewRole !== 'All') url += `&role=${encodeURIComponent(viewRole)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setViewRecords(data.attendance || []);
      }
    } catch (err) {
      notify('Failed to fetch records: ' + err.message, 'error');
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => { if (activeTab === 'view') fetchViewRecords(); }, [viewDate, viewRole, activeTab]);

  // Fetch monthly summary
  const fetchMonthly = async () => {
    setMonthlyLoading(true);
    try {
      const res = await fetch(`/api/admin/staff-attendance/summary?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMonthlyData(data.summary || []);
      }
    } catch (err) {
      notify('Failed to fetch monthly data: ' + err.message, 'error');
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => { if (activeTab === 'monthly') fetchMonthly(); }, [selectedMonth, activeTab]);

  // Update a staff member's status in the local map
  const setStatus = (staffId, field, value) => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], [field]: value }
    }));
  };

  // Save all attendance
  const handleSave = async () => {
    setSaving(true);
    try {
      const records = allStaff.map(s => ({
        staffId: s.id,
        date: selectedDate,
        status: attendanceMap[s.id]?.status || 'Present',
        remarks: attendanceMap[s.id]?.remarks || ''
      }));

      const res = await fetch('/api/admin/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(data.message);
      fetchAttendanceForDate(selectedDate);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Update a single attendance record inline
  const handleUpdateRecord = async (id, status, remarks) => {
    try {
      const res = await fetch(`/api/admin/staff-attendance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, remarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify('Updated successfully');
      fetchViewRecords();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const filteredStaff = roleFilter === 'All' ? allStaff :
    allStaff.filter(s => s.role === roleFilter);

  const presentCount = filteredStaff.filter(s => (attendanceMap[s.id]?.status || 'Present') === 'Present').length;
  const absentCount  = filteredStaff.filter(s => (attendanceMap[s.id]?.status) === 'Absent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Status Banner */}
      {statusMsg && (
        <div style={{
          padding: '12px 18px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600,
          background: statusType === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
          color: statusType === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${statusType === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
        }}>
          {statusMsg}
        </div>
      )}

      {/* Tab Selector */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'mark', label: 'Mark Attendance', Icon: CheckSquare },
            { id: 'view', label: 'View by Date', Icon: Calendar },
            { id: 'monthly', label: 'Monthly Summary', Icon: BarChart3 }
          ].map(({ id, label, Icon }) => (
            <button key={id} type="button"
              onClick={() => setActiveTab(id)}
              className={activeTab === id ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Filter by Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-dim)" />
          <select className="form-input" style={{ width: '160px' }}
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            {STAFF_ROLES_FILTER.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
          </select>
        </div>
      </div>

      {/* ── MARK ATTENDANCE TAB ─────────────────────────────── */}
      {activeTab === 'mark' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Date + Save Header */}
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="var(--primary-light)" />
              <input type="date" value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="form-input" style={{ width: '160px', padding: '8px 12px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {filteredStaff.length} staff &bull; {presentCount} present &bull; {absentCount} absent
              </span>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15} /> {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Mark All Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(s => {
              const cfg = STATUS_CONFIG[s];
              const Ico = cfg.icon;
              return (
                <button key={s} type="button"
                  onClick={() => {
                    const newMap = { ...attendanceMap };
                    filteredStaff.forEach(sf => {
                      newMap[sf.id] = { ...newMap[sf.id], status: s };
                    });
                    setAttendanceMap(newMap);
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}>
                  <Ico size={13} /> Mark All {s}
                </button>
              );
            })}
          </div>

          {/* Staff Attendance Table */}
          {loadingStaff ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading staff...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', borderRadius: '16px', color: 'var(--text-muted)' }}>
              No staff found for selected role.
            </div>
          ) : (
            <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Staff Member', 'Role', 'Status', 'Remarks'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(s => {
                    const current = attendanceMap[s.id] || {};
                    const status = current.status || 'Present';
                    const cfg = STATUS_CONFIG[status];
                    return (
                      <tr key={s.id}
                        style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{s.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>@{s.username}</div>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.role}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {STATUS_OPTIONS.map(opt => {
                              const optCfg = STATUS_CONFIG[opt];
                              return (
                                <button key={opt} type="button"
                                  onClick={() => setStatus(s.id, 'status', opt)}
                                  style={{
                                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                                    background: status === opt ? optCfg.bg : 'transparent',
                                    color: status === opt ? optCfg.color : 'var(--text-dim)',
                                    border: `1px solid ${status === opt ? optCfg.color + '60' : 'var(--border-subtle)'}`,
                                    cursor: 'pointer', transition: 'all 0.15s'
                                  }}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <input className="form-input" style={{ padding: '5px 10px', fontSize: '0.78rem', width: '100%' }}
                            placeholder="Remarks (optional)"
                            value={current.remarks || ''}
                            onChange={e => setStatus(s.id, 'remarks', e.target.value)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW BY DATE TAB ──────────────────────────────────── */}
      {activeTab === 'view' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Calendar size={16} color="var(--primary-light)" />
            <input type="date" value={viewDate}
              onChange={e => setViewDate(e.target.value)}
              className="form-input" style={{ width: '160px' }} />
            <select className="form-input" style={{ width: '160px' }}
              value={viewRole} onChange={e => setViewRole(e.target.value)}>
              {STAFF_ROLES_FILTER.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
            </select>
            <button type="button" className="btn btn-secondary" onClick={fetchViewRecords}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Staff Member', 'Role', 'Status', 'Remarks', 'Marked By'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewLoading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : viewRecords.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No records for {viewDate}</td></tr>
                ) : viewRecords.map(rec => {
                  const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.Present;
                  const SIco = cfg.icon;
                  return (
                    <tr key={rec.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{rec.staff_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{rec.department || ''}</div>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.staff_role}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', background: cfg.bg, color: cfg.color, fontSize: '0.78rem', fontWeight: 700 }}>
                          <SIco size={12} /> {rec.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.remarks || '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>{rec.marked_by_name || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MONTHLY SUMMARY TAB ────────────────────────────────── */}
      {activeTab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Calendar size={16} color="var(--primary-light)" />
            <input type="month" value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="form-input" style={{ width: '180px' }} />
            <button type="button" className="btn btn-secondary" onClick={fetchMonthly}>
              <RefreshCw size={14} />
            </button>
          </div>

          {monthlyLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>
          ) : monthlyData.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', borderRadius: '16px', color: 'var(--text-muted)' }}>
              No attendance data for {selectedMonth}
            </div>
          ) : (
            <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Staff Member', 'Role', 'Dept', 'Total', 'Present', 'Absent', 'Leave', 'Half', 'Attendance %'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map(row => {
                    const pct = row.total_days > 0 ? Math.round((row.present / row.total_days) * 100) : 0;
                    return (
                      <tr key={row.staff_id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: '#fff', fontSize: '0.86rem' }}>{row.staff_name}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.staff_role}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>{row.department || '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600 }}>{row.total_days}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.86rem', color: '#34d399', fontWeight: 700 }}>{row.present}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.86rem', color: '#f87171', fontWeight: 700 }}>{row.absent}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.86rem', color: '#fbbf24', fontWeight: 700 }}>{row.leave}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.86rem', color: '#94a3b8', fontWeight: 700 }}>{row.half_day}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171' }}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
