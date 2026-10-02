import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { 
  BookOpen, Users, CheckCircle2, ClipboardList, Award, 
  Calendar, Clock, Check, X, AlertCircle, ShieldAlert,
  FileText, CheckSquare, Sparkles, Send, Filter, CalendarDays
} from 'lucide-react';

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { [studentId]: 'Present' | 'Absent' }
  const [remarksState, setRemarksState] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'attendance', 'timetable', 'results', 'permissions', 'classes'
  const [permissions, setPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Timetable State
  const [teachingTimetable, setTeachingTimetable] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // Results State
  const [classResults, setClassResults] = useState([]);
  const [resultsClassId, setResultsClassId] = useState('');
  const [loadingResults, setLoadingResults] = useState(false);

  // 1. Fetch Teacher Assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/teacher/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
        if (data.assignments.length > 0) {
          setSelectedClassId(data.assignments[0].class_id);
          setSelectedSubjectId(data.assignments[0].subject_id);
          setResultsClassId(data.assignments[0].class_id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Fetch Students for the selected class & period
  const fetchStudents = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    setLoadingStudents(true);
    try {
      const res = await fetch(
        `/api/teacher/class-students?classId=${selectedClassId}&subjectId=${selectedSubjectId}&date=${selectedDate}&period=${selectedPeriod}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        
        // Initialize state
        const initialStatus = {};
        const initialRemarks = {};
        data.students.forEach(s => {
          initialStatus[s.student_id] = s.currentStatus || 'Present';
          initialRemarks[s.student_id] = s.remarks || '';
        });
        setAttendanceState(initialStatus);
        setRemarksState(initialRemarks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 3. Fetch Permission Requests
  const fetchPermissions = async () => {
    setLoadingPerms(true);
    try {
      const res = await fetch('/api/teacher/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPerms(false);
    }
  };

  // 4. Fetch Teaching Timetable
  const fetchTeachingTimetable = async () => {
    setLoadingTimetable(true);
    try {
      const res = await fetch('/api/timetable/my-teaching', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeachingTimetable(data.timetable || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimetable(false);
    }
  };

  // 5. Fetch Class Results
  const fetchClassResults = async (classId) => {
    if (!classId) return;
    setLoadingResults(true);
    try {
      const res = await fetch(`/api/results/class-results?classId=${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClassResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      fetchStudents();
    }
  }, [selectedClassId, selectedSubjectId, selectedDate, selectedPeriod]);

  useEffect(() => {
    if (activeNav === 'permissions') {
      fetchPermissions();
    } else if (activeNav === 'timetable') {
      fetchTeachingTimetable();
    } else if (activeNav === 'results' && resultsClassId) {
      fetchClassResults(resultsClassId);
    }
  }, [activeNav, resultsClassId]);

  // Handle individual toggle
  const toggleStatus = (studentId, newStatus) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: newStatus }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.student_id] = s.hasApprovedLeave ? 'On Leave' : 'Present';
    });
    setAttendanceState(updated);
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    setStatusMessage('');
    const attendanceList = students.map(s => ({
      studentId: s.student_id,
      status: attendanceState[s.student_id] || 'Present',
      remarks: remarksState[s.student_id] || ''
    }));

    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          date: selectedDate,
          period: selectedPeriod,
          attendanceList
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');

      if (data.notificationsSent > 0) {
        setStatusMessage(`Attendance saved for Period ${selectedPeriod}! Automated absence alert sent to ${data.notificationsSent} linked parent(s).`);
      } else {
        setStatusMessage(`Attendance saved successfully for Period ${selectedPeriod}! (No unapproved absences)`);
      }
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  // Review permission
  const handleReviewPermission = async (id, action) => {
    try {
      const res = await fetch(`/api/teacher/permissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      fetchPermissions();
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedClass = assignments.find(a => a.class_id === parseInt(selectedClassId, 10));
  const selectedSubject = assignments.find(a => a.subject_id === parseInt(selectedSubjectId, 10));
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const navTitles = {
    dashboard: 'Teacher Dashboard', attendance: 'Take Attendance', timetable: 'Teaching Timetable',
    results: 'Marks & Results', permissions: 'Leave Approvals', classes: 'My Classes & Subjects',
    profile: 'Faculty Profile', settings: 'Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Dashboard'}
      subtitle={`${user?.department || user?.post || 'Faculty'} • ${assignments.length} Class Assignment(s)`}
      badgeCounts={{ pendingPerms: permissions.filter(p => p.teacher_approval === 'PENDING').length }}
    >

      {/* Status Message */}
      {statusMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#34d399',
          fontSize: '0.92rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* DASHBOARD OVERVIEW */}
      {activeNav === 'dashboard' && (
        <div>
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}><BookOpen size={24} /></div>
              <div><div className="stat-label">Assigned Classes</div><div className="stat-value">{new Set(assignments.map(a => a.class_id)).size}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{assignments.length} Subject(s)</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}><FileText size={24} /></div>
              <div><div className="stat-label">Pending Approvals</div><div className="stat-value" style={{ color: '#fbbf24' }}>{permissions.filter(p => p.teacher_approval === 'PENDING').length}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Permission Requests</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}><Users size={24} /></div>
              <div><div className="stat-label">Class Students</div><div className="stat-value">{students.length}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>In Current Selection</div></div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Welcome, Prof. {user?.name}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.92rem' }}>{user?.department || user?.post} • EduSphere</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {[['attendance','Take Attendance'],['timetable','My Timetable'],['results','Student Results'],['permissions','Leave Approvals'],['classes','My Classes']].map(([id,label]) => (
                <button key={id} type="button" onClick={() => setActiveNav(id)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '10px', fontSize: '0.85rem' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAKING FLOW */}
      {activeNav === 'attendance' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          {/* Controls Bar: Class -> Subject -> Date -> Period */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* 1. Select Class */}
            <div>
              <label className="input-label">1. Assigned Class</label>
              <select
                className="form-control"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
              >
                {Array.from(new Set(assignments.map(a => a.class_id))).map(cid => {
                  const a = assignments.find(x => x.class_id === cid);
                  return <option key={cid} value={cid}>{a.class_name}</option>;
                })}
              </select>
            </div>

            {/* 2. Select Subject */}
            <div>
              <label className="input-label">2. Subject</label>
              <select
                className="form-control"
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
              >
                {assignments
                  .filter(a => a.class_id === parseInt(selectedClassId, 10))
                  .map(a => (
                    <option key={a.subject_id} value={a.subject_id}>
                      {a.subject_name} ({a.subject_code})
                    </option>
                  ))}
              </select>
            </div>

            {/* 3. Select Date */}
            <div>
              <label className="input-label">3. Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            {/* 4. Select Period */}
            <div>
              <label className="input-label">4. Period</label>
              <select
                className="form-control"
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(parseInt(e.target.value, 10))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(p => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>
                Class Roster: {selectedClass?.class_name || 'Class'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing all {students.length} students enrolled in this section. Mark Present / Absent below.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                <CheckSquare size={16} />
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                className="btn btn-primary"
                style={{ fontSize: '0.9rem', padding: '10px 20px', borderRadius: '12px' }}
              >
                <Send size={16} />
                <span>Save Attendance (Period {selectedPeriod})</span>
              </button>
            </div>
          </div>

          {/* Student Attendance List */}
          <div className="table-container">
            <table className="custom-table" id="attendanceTable">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Roll #</th>
                  <th>Student Name</th>
                  <th>Department & Year</th>
                  <th>Linked Parent Contact</th>
                  <th>Status & Leave Check</th>
                  <th style={{ textAlign: 'center', width: '220px' }}>Attendance Toggle</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => {
                  const current = attendanceState[s.student_id] || 'Present';
                  return (
                    <tr key={s.student_id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                        {s.roll_no}
                      </td>
                      <td style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                        {s.student_name}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {s.department} • Year {s.year}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        {s.parent_name ? (
                          <span>
                            <strong style={{ color: '#cbd5e1' }}>{s.parent_name}</strong> ({s.parent_phone})
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic' }}>No Parent Linked</span>
                        )}
                      </td>
                      <td>
                        {s.hasApprovedLeave ? (
                          <span className="badge badge-parent" style={{ fontSize: '0.72rem' }}>
                            On Approved Leave
                          </span>
                        ) : current === 'Absent' ? (
                          <span className="badge badge-overdue" style={{ fontSize: '0.72rem' }}>
                            Marked Absent
                          </span>
                        ) : (
                          <span className="badge badge-student" style={{ fontSize: '0.72rem' }}>
                            Present
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => toggleStatus(s.student_id, 'Present')}
                            className="btn"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.8rem',
                              borderRadius: '8px',
                              background: current === 'Present' ? '#10b981' : 'transparent',
                              color: current === 'Present' ? '#fff' : 'var(--text-muted)'
                            }}
                          >
                            <Check size={14} /> Present
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(s.student_id, 'Absent')}
                            className="btn"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.8rem',
                              borderRadius: '8px',
                              background: current === 'Absent' ? '#ef4444' : 'transparent',
                              color: current === 'Absent' ? '#fff' : 'var(--text-muted)'
                            }}
                          >
                            <X size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && !loadingStudents && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MY TEACHING TIMETABLE */}
      {activeNav === 'timetable' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>My Weekly Teaching Schedule</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Period breakdown, assigned classes, and designated lecture rooms for Prof. {user?.name}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {daysOfWeek.map(day => {
              const daySlots = teachingTimetable.filter(t => t.day === day);
              return (
                <div key={day} style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '16px 20px'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '1rem', marginBottom: '12px' }}>
                    {day}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {daySlots.map(s => (
                      <div key={s.id} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px 14px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#fbbf24' }}>Period {s.period}</span>
                          <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{s.room_no}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{s.subject_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: '2px' }}>{s.class_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{s.start_time} - {s.end_time}</div>
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>No lectures scheduled on {day}.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STUDENT RESULTS VIEW */}
      {activeNav === 'results' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Class Semester Results</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                View academic marks and grades for students in your assigned classes (Strictly Read-Only)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="input-label" style={{ margin: 0 }}>Filter Class:</label>
              <select
                className="form-control"
                style={{ width: '220px' }}
                value={resultsClassId}
                onChange={e => setResultsClassId(e.target.value)}
              >
                {Array.from(new Set(assignments.map(a => a.class_id))).map(cid => {
                  const a = assignments.find(x => x.class_id === cid);
                  return <option key={cid} value={cid}>{a.class_name}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Name</th>
                  <th>Semester</th>
                  <th>Subject</th>
                  <th>Internal</th>
                  <th>External</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {classResults.map(r => (
                  <tr key={r.id}>
                    <td><strong style={{ color: 'var(--primary-light)' }}>{r.roll_no}</strong></td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{r.student_name}</td>
                    <td>Semester {r.semester}</td>
                    <td>{r.subject_name} (<code style={{ fontSize: '0.75rem' }}>{r.subject_code}</code>)</td>
                    <td>{r.internal_marks} / 30</td>
                    <td>{r.external_marks} / 70</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{r.total_marks} / 100</td>
                    <td><span className="badge badge-student">{r.grade}</span></td>
                    <td>{r.credits}</td>
                  </tr>
                ))}
                {classResults.length === 0 && !loadingResults && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No semester results recorded for this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERMISSION REQUESTS */}
      {activeNav === 'permissions' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Student Permission Requests (Leave & Outing)</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Review requests submitted by students in your assigned classes. Accepted requests advance to the Principal for final approval.
            </p>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Student</th>
                  <th>Class / Roll</th>
                  <th>Date & Schedule</th>
                  <th>Reason / Details</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className={`badge ${p.type === 'LEAVE' ? 'badge-teacher' : 'badge-admin'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.student_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.class_name} (Roll {p.roll_no})</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.date}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {p.type === 'LEAVE' 
                          ? `Periods: ${p.start_period || 1} to ${p.end_period || 7}` 
                          : `${p.leaving_time} - ${p.expected_return_time} (${p.destination})`}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{p.reason}</div>
                      {p.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.notes}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                        Teacher: <strong style={{ color: p.teacher_approval === 'APPROVED' ? '#34d399' : p.teacher_approval === 'REJECTED' ? '#ef4444' : '#fbbf24' }}>{p.teacher_approval}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Principal: {p.principal_approval}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {p.teacher_approval === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleReviewPermission(p.id, 'ACCEPT')}
                            className="btn btn-success"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewPermission(p.id, 'REJECT')}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {permissions.length === 0 && !loadingPerms && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No permission requests at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGNED CLASSES */}
      {activeNav === 'classes' && (
        <div className="stat-grid">
          {assignments.map(a => (
            <div key={a.assignment_id} className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{a.class_name}</div>
                <div style={{ color: '#93c5fd', fontSize: '0.85rem' }}>{a.subject_name} ({a.subject_code})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {a.department} • Semester {a.semester}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeNav === 'profile' && <ProfilePage />}

      {/* SETTINGS VIEW */}
      {activeNav === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}
