import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, CheckSquare, Search, Filter, CheckCircle2, 
  XCircle, Clock, Edit3, UserCheck, Check, X, AlertCircle, 
  BarChart2, ShieldCheck, FileText, ArrowRight
} from 'lucide-react';

export default function TeacherAttendanceModule() {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [records, setRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { [teacherId]: { status, remarks } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Monthly stats view state
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [monthlyStats, setMonthlyStats] = useState(null);

  // Edit record modal state
  const [editingRecord, setEditingRecord] = useState(null);

  // Fetch daily attendance
  const fetchDailyAttendance = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/teacher-attendance?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch teacher attendance');

      setRecords(data.records || []);
      setTeachers(data.teachers || []);

      // Build initial editable state
      const stateMap = {};
      // 1. Initialize all active teachers as Present by default
      (data.teachers || []).forEach(t => {
        stateMap[t.id] = { status: 'Present', remarks: '' };
      });
      // 2. Override with existing records for that date
      (data.records || []).forEach(r => {
        stateMap[r.teacher_id] = { status: r.status, remarks: r.remarks || '' };
      });

      setAttendanceState(stateMap);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly stats
  const fetchMonthlyStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/teacher-attendance-stats?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMonthlyStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailyAttendance();
    } else {
      fetchMonthlyStats();
    }
  }, [selectedDate, viewMode, selectedMonth, token]);

  // Bulk set status for all teachers
  const handleMarkAll = (status) => {
    const updated = { ...attendanceState };
    teachers.forEach(t => {
      updated[t.id] = {
        ...updated[t.id],
        status
      };
    });
    setAttendanceState(updated);
  };

  // Toggle status for individual teacher
  const handleStatusChange = (teacherId, newStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status: newStatus
      }
    }));
  };

  // Update remarks
  const handleRemarksChange = (teacherId, remarks) => {
    setAttendanceState(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        remarks
      }
    }));
  };

  // Save attendance for the selected date
  const handleSaveAttendance = async () => {
    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const payload = teachers.map(t => ({
        teacherId: t.id,
        date: selectedDate,
        status: attendanceState[t.id]?.status || 'Present',
        remarks: attendanceState[t.id]?.remarks || ''
      }));

      const res = await fetch('/api/admin/teacher-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records: payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message || 'Faculty attendance saved successfully.');
      fetchDailyAttendance();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save edited past record
  const handleSaveEditRecord = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      const res = await fetch(`/api/admin/teacher-attendance/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editingRecord.status,
          remarks: editingRecord.remarks
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage('Teacher attendance entry updated.');
      setEditingRecord(null);
      fetchDailyAttendance();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter teachers list
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.department && t.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.employee_id && t.employee_id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = departmentFilter === 'All' || t.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(teachers.map(t => t.department).filter(Boolean))];

  // Quick count stats for the day
  const presentCount = Object.values(attendanceState).filter(s => s.status === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s.status === 'Absent').length;
  const leaveCount = Object.values(attendanceState).filter(s => s.status === 'Leave').length;
  const halfDayCount = Object.values(attendanceState).filter(s => s.status === 'Half-Day').length;

  return (
    <div>
      {/* Messages */}
      {statusMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399'
        }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#f87171'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Controls & Navigation */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-teacher" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                <ShieldCheck size={12} /> Separate Faculty Ledger
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tracked distinctly from Student Attendance
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Teacher & Faculty Attendance Desk
            </h3>
          </div>

          {/* Toggle View: Daily vs Monthly */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`btn ${viewMode === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              <Calendar size={15} />
              <span>Daily Roll Call</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              <BarChart2 size={15} />
              <span>Monthly Summary & History</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {viewMode === 'daily' ? (
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="input-label" style={{ marginBottom: '6px' }}>Attendance Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <label className="input-label" style={{ marginBottom: '6px' }}>Search Faculty Member</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Search by teacher name, ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ flex: '1 1 180px' }}>
              <label className="input-label" style={{ marginBottom: '6px' }}>Department Filter</label>
              <select
                className="form-control"
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="btn btn-secondary"
                style={{ borderRadius: '10px', fontSize: '0.82rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
              >
                All Present
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="btn btn-primary"
                style={{ borderRadius: '10px', fontSize: '0.85rem' }}
              >
                <CheckSquare size={16} />
                <span>{saving ? 'Saving...' : 'Save Today\'s Attendance'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', alignItems: 'flex-end' }}>
            <div style={{ minWidth: '220px' }}>
              <label className="input-label" style={{ marginBottom: '6px' }}>Select Month (YYYY-MM)</label>
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 1. DAILY ROLL CALL VIEW */}
      {/* ==================================================== */}
      {viewMode === 'daily' && (
        <div>
          {/* Quick Metrics */}
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Check size={24} />
              </div>
              <div>
                <div className="stat-label">Present</div>
                <div className="stat-value" style={{ color: '#34d399' }}>{presentCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Faculty On Duty</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <X size={24} />
              </div>
              <div>
                <div className="stat-label">Absent</div>
                <div className="stat-value" style={{ color: '#f87171' }}>{absentCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Unexcused</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-label">Leave / Out</div>
                <div className="stat-value" style={{ color: '#fbbf24' }}>{leaveCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Official Leave</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div className="stat-label">Half-Day</div>
                <div className="stat-value" style={{ color: '#818cf8' }}>{halfDayCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Partial Duty</div>
              </div>
            </div>
          </div>

          {/* Teacher Attendance Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Faculty Roster for {selectedDate} ({filteredTeachers.length} Teachers)
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Click status pills to mark attendance
              </span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Teacher Name & ID</th>
                    <th>Department</th>
                    <th>Attendance Status</th>
                    <th>Remarks / Reason</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(t => {
                    const currentStatus = attendanceState[t.id]?.status || 'Present';
                    const currentRemarks = attendanceState[t.id]?.remarks || '';
                    const existingRecord = records.find(r => r.teacher_id === t.id);

                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{t.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ID: {t.employee_id || `FAC-${t.id}`} • {t.email}
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-secondary">{t.department || 'Faculty'}</span>
                        </td>

                        {/* Interactive Status Selector */}
                        <td>
                          <div style={{ display: 'inline-flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px' }}>
                            {[
                              { label: 'Present', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
                              { label: 'Absent', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
                              { label: 'Leave', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
                              { label: 'Half-Day', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.2)' }
                            ].map(s => {
                              const isSelected = currentStatus === s.label;
                              return (
                                <button
                                  key={s.label}
                                  type="button"
                                  onClick={() => handleStatusChange(t.id, s.label)}
                                  style={{
                                    border: isSelected ? `1px solid ${s.color}` : '1px solid transparent',
                                    background: isSelected ? s.bg : 'transparent',
                                    color: isSelected ? s.color : 'var(--text-muted)',
                                    fontWeight: isSelected ? 800 : 500,
                                    fontSize: '0.78rem',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Inline Remarks Input */}
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                            placeholder="Optional notes..."
                            value={currentRemarks}
                            onChange={e => handleRemarksChange(t.id, e.target.value)}
                          />
                        </td>

                        {/* Action buttons */}
                        <td style={{ textAlign: 'right' }}>
                          {existingRecord ? (
                            <button
                              type="button"
                              onClick={() => setEditingRecord(existingRecord)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px' }}
                              title="Edit saved entry"
                            >
                              <Edit3 size={13} />
                              <span>Edit Record</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              Unsaved
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        No teachers found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. MONTHLY SUMMARY & HISTORY VIEW */}
      {/* ==================================================== */}
      {viewMode === 'monthly' && monthlyStats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Monthly Aggregate Overview */}
          <div className="stat-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div className="stat-label">Total Logged Entries</div>
                <div className="stat-value">{monthlyStats.summary?.total_entries || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>In {monthlyStats.month}</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-label">Total Present Days</div>
                <div className="stat-value" style={{ color: '#34d399' }}>{monthlyStats.summary?.present_count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Across Faculty</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <XCircle size={24} />
              </div>
              <div>
                <div className="stat-label">Absent Days</div>
                <div className="stat-value" style={{ color: '#f87171' }}>{monthlyStats.summary?.absent_count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Total Absences</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-label">Approved Leaves</div>
                <div className="stat-value" style={{ color: '#fbbf24' }}>{monthlyStats.summary?.leave_count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Sanctioned Leaves</div>
              </div>
            </div>
          </div>

          {/* Teacher Breakdown Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Faculty Monthly Attendance Ledger ({monthlyStats.month})
            </h4>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Department</th>
                    <th>Days Tracked</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Leave</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.byTeacher?.map(t => {
                    const pct = t.total_days > 0 ? Math.round((t.present_days / t.total_days) * 100) : 0;
                    return (
                      <tr key={t.teacher_id}>
                        <td style={{ fontWeight: 700, color: '#fff' }}>{t.teacher_name}</td>
                        <td><span className="badge badge-secondary">{t.department || 'Faculty'}</span></td>
                        <td>{t.total_days}</td>
                        <td><span style={{ color: '#34d399', fontWeight: 700 }}>{t.present_days}</span></td>
                        <td><span style={{ color: t.absent_days > 0 ? '#ef4444' : 'var(--text-dim)', fontWeight: 700 }}>{t.absent_days}</span></td>
                        <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{t.leave_days}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, minWidth: '60px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: pct >= 80 ? '#34d399' : '#fbbf24' }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!monthlyStats.byTeacher || monthlyStats.byTeacher.length === 0) && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        No teacher attendance recorded for {monthlyStats.month}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* EDIT MODAL FOR PAST RECORD */}
      {/* ==================================================== */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Edit Teacher Attendance Record
              </h3>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditRecord}>
              <div style={{ marginBottom: '14px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>TEACHER</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{editingRecord.teacher_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>Date: {editingRecord.date}</div>
              </div>

              <div className="input-group">
                <label className="input-label">Attendance Status</label>
                <select
                  className="form-control"
                  value={editingRecord.status}
                  onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value })}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Half-Day">Half-Day</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Remarks / Correction Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Corrected by Principal approval"
                  value={editingRecord.remarks || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ borderRadius: '10px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
