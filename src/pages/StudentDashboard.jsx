import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import CanteenModule from '../components/CanteenModule';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { 
  GraduationCap, Calendar, CheckCircle2, Clock, BookOpen, 
  Award, AlertCircle, FileText, Check, PlusCircle, Send, 
  MapPin, Banknote, ShieldAlert, Sparkles, X, BookMarked, Library
} from 'lucide-react';

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'attendance', 'results', 'timetable', 'library', 'canteen', 'fees', 'permissions', 'profile'
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOutingModal, setShowOutingModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startPeriod: 1,
    endPeriod: 7,
    reason: '',
    notes: ''
  });

  // Outing Form
  const [outingForm, setOutingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    leavingTime: '02:00 PM',
    expectedReturnTime: '05:30 PM',
    destination: '',
    reason: '',
    notes: ''
  });

  const loadData = async () => {
    try {
      const [dashRes, resRes, ttRes, libRes] = await Promise.all([
        fetch('/api/student/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/results/my-results', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/timetable/my-class', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/library/my-books', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (dashRes.ok) setData(await dashRes.json());
      if (resRes.ok) setResultsData(await resRes.json());
      if (ttRes.ok) setTimetableData(await ttRes.json());
      if (libRes.ok) setLibraryData(await libRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/student/leave-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(leaveForm)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      setStatusMessage(resData.message);
      setShowLeaveModal(false);
      setLeaveForm({ date: new Date().toISOString().split('T')[0], startPeriod: 1, endPeriod: 7, reason: '', notes: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOutingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/student/outing-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(outingForm)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      setStatusMessage(resData.message);
      setShowOutingModal(false);
      setOutingForm({ date: new Date().toISOString().split('T')[0], leavingTime: '02:00 PM', expectedReturnTime: '05:30 PM', destination: '', reason: '', notes: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-muted)' }}>
        Loading Student Academic Portal...
      </div>
    );
  }

  const student = data?.student;
  const attendance = data?.attendance || { percentage: 0, totalPeriods: 0, records: [] };
  const fees = data?.fees || { total_fee: 0, paid_amount: 0, pending_amount: 0, history: [] };
  const permissions = data?.permissions || [];
  const activeLoans = libraryData?.activeLoans || [];
  const timetable = timetableData?.timetable || [];

  const getStatusBadge = (finalStatus) => {
    switch (finalStatus) {
      case 'APPROVED':
        return <span className="badge badge-student" style={{ padding: '4px 10px' }}><Check size={12} /> Permission Granted</span>;
      case 'TEACHER_APPROVED':
        return <span className="badge badge-teacher" style={{ padding: '4px 10px' }}><Clock size={12} /> Teacher Approved (Pending Principal)</span>;
      case 'REJECTED':
        return <span className="badge badge-overdue" style={{ padding: '4px 10px' }}><X size={12} /> Permission Rejected</span>;
      default:
        return <span className="badge badge-parent" style={{ padding: '4px 10px' }}><Clock size={12} /> Pending Teacher Review</span>;
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const navTitles = {
    dashboard: 'Student Dashboard', attendance: 'My Attendance', results: 'My Results',
    timetable: 'My Timetable', library: 'Library Books', canteen: 'Canteen & Food',
    fees: 'Fees & Ledger', permissions: 'Leave / Outing Requests', profile: 'My Profile',
    settings: 'Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Dashboard'}
      subtitle={`${student?.roll_no ? `Roll #${student.roll_no} • ` : ''}${student?.class_name || ''}`}
      badgeCounts={{ libraryLoans: activeLoans.length }}
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
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}><CheckCircle2 size={24} /></div>
              <div><div className="stat-label">Attendance Rate</div><div className="stat-value" style={{ color: '#34d399' }}>{attendance.percentage}%</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{attendance.totalPeriods} Total Periods</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}><Award size={24} /></div>
              <div><div className="stat-label">CGPA</div><div className="stat-value" style={{ color: '#fbbf24' }}>{resultsData?.overallCGPA || 'N/A'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Cumulative Grade</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf' }}><BookOpen size={24} /></div>
              <div><div className="stat-label">Borrowed Books</div><div className="stat-value">{activeLoans.length}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Active Loans</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><Banknote size={24} /></div>
              <div><div className="stat-label">Pending Fees</div><div className="stat-value">₹{fees.pending_amount?.toLocaleString() || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Outstanding Balance</div></div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Welcome, {user?.name}!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.92rem' }}>Roll #{student?.roll_no} • {student?.class_name} • {student?.department}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {[['attendance','My Attendance'],['results','My Results'],['timetable','My Timetable'],['library','Library Books'],['canteen','Canteen & Food'],['fees','Fee Ledger'],['permissions','Leave Requests']].map(([id,label]) => (
                <button key={id} type="button" onClick={() => setActiveNav(id)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '10px', fontSize: '0.85rem' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE */}
      {activeNav === 'attendance' && (
        <div>
          <div className="stat-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="stat-label">Attendance Rate</div>
                <div className="stat-value" style={{ color: '#34d399' }}>{attendance.percentage}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {attendance.presentPeriods} Present • {attendance.onLeavePeriods || 0} On Leave • {attendance.absentPeriods || 0} Absent
                </div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Clock size={26} />
              </div>
              <div>
                <div className="stat-label">Total Periods Recorded</div>
                <div className="stat-value">{attendance.totalPeriods}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Current Semester Sessions
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Period-wise Attendance Ledger</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Subject</th>
                    <th>Instructor</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.records.map((a, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{a.date}</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>Period {a.period}</span></td>
                      <td>{a.subject_name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{a.teacher_name}</td>
                      <td>
                        <span className={`badge badge-${a.status === 'Present' ? 'student' : a.status === 'On Leave' ? 'parent' : 'overdue'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{a.remarks || '—'}</td>
                    </tr>
                  ))}
                  {attendance.records.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        No attendance records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SEMESTER RESULTS */}
      {activeNav === 'results' && (
        <div>
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Award size={26} />
              </div>
              <div>
                <div className="stat-label">Cumulative GPA (CGPA)</div>
                <div className="stat-value" style={{ color: '#fbbf24' }}>{resultsData?.overallCGPA || '9.44'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  First Class with Distinction
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {resultsData?.semesters?.map(sem => (
              <div key={sem.semester} className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>Semester {sem.semester} Grade Card</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Year 2025-2026</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SEMESTER GPA</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{sem.gpa}</div>
                  </div>
                </div>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Internal</th>
                        <th>External</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Credits</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.courses.map(c => (
                        <tr key={c.id}>
                          <td><code style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{c.subject_code}</code></td>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{c.subject_name}</td>
                          <td>{c.internal_marks} / 30</td>
                          <td>{c.external_marks} / 70</td>
                          <td style={{ fontWeight: 700, color: '#fff' }}>{c.total_marks} / 100</td>
                          <td><span className="badge badge-student">{c.grade}</span></td>
                          <td>{c.credits}</td>
                          <td>
                            <span style={{ color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> PASS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMETABLE */}
      {activeNav === 'timetable' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Weekly Academic Schedule ({timetableData?.classInfo?.name})</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Period-wise class routine, faculty instructors, and assigned lecture halls
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {daysOfWeek.map(day => {
              const daySlots = timetable.filter(t => t.day === day);
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {daySlots.map(s => (
                      <div key={s.id} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '10px 12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>Period {s.period}</span>
                          <span>{s.room_no}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{s.subject_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#93c5fd', marginTop: '2px' }}>{s.teacher_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{s.start_time} - {s.end_time}</div>
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>No lectures scheduled.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIBRARY BOOKS */}
      {activeNav === 'library' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Central Library Borrowing Record</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Books currently in your possession and past return logs (Strictly Read-Only)
            </p>
          </div>

          <h4 style={{ fontSize: '1.05rem', color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookMarked size={18} /> Currently Borrowed Books ({activeLoans.length})
          </h4>
          <div className="table-container" style={{ marginBottom: '28px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Code</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Issue Date</th>
                  <th>Return Due Date</th>
                  <th>Shelf Location</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map(l => (
                  <tr key={l.id}>
                    <td><code style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{l.book_code}</code></td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{l.book_title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{l.author}</td>
                    <td><span className="badge badge-secondary">{l.category}</span></td>
                    <td>{l.issue_date}</td>
                    <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{l.due_date}</span></td>
                    <td style={{ color: 'var(--text-dim)' }}>{l.shelf_location || 'General'}</td>
                  </tr>
                ))}
                {activeLoans.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                      You have zero active borrowed books.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Past Borrowing History
          </h4>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Code</th>
                  <th>Title</th>
                  <th>Issued</th>
                  <th>Returned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {libraryData?.pastLoans?.map(l => (
                  <tr key={l.id}>
                    <td><code>{l.book_code}</code></td>
                    <td>{l.book_title}</td>
                    <td>{l.issue_date}</td>
                    <td>{l.return_date}</td>
                    <td><span className="badge badge-student">Returned</span></td>
                  </tr>
                ))}
                {(!libraryData?.pastLoans || libraryData.pastLoans.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)' }}>
                      No past borrowing logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEES & PAYMENTS */}
      {activeNav === 'fees' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>College Tuition & Fee Ledger</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Official records maintained by the Cashier desk. Student view is strictly read-only.
            </p>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="glass-panel stat-card">
              <div>
                <div className="stat-label">Total Course Fee</div>
                <div className="stat-value">₹{fees.total_fee?.toLocaleString()}</div>
              </div>
            </div>
            <div className="glass-panel stat-card">
              <div>
                <div className="stat-label">Total Amount Paid</div>
                <div className="stat-value" style={{ color: '#34d399' }}>₹{fees.paid_amount?.toLocaleString()}</div>
              </div>
            </div>
            <div className="glass-panel stat-card">
              <div>
                <div className="stat-label">Remaining Pending Balance</div>
                <div className="stat-value" style={{ color: fees.pending_amount > 0 ? '#fbbf24' : '#34d399' }}>
                  ₹{fees.pending_amount?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Official Payment Receipts & History</h4>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Payment Date</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Received By</th>
                </tr>
              </thead>
              <tbody>
                {fees.history?.map((h, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{h.receipt_no}</td>
                    <td style={{ color: '#fff' }}>{h.payment_date}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>₹{h.amount?.toLocaleString()}</td>
                    <td><span className="badge badge-secondary">{h.payment_method}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{h.cashier_name || 'Cashier Desk'}</td>
                  </tr>
                ))}
                {(!fees.history || fees.history.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CANTEEN MODULE */}
      {activeNav === 'canteen' && <CanteenModule />}

      {/* PERMISSIONS (LEAVE & OUTINGS) */}
      {activeNav === 'permissions' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Permission Management (Leave & Outing)</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Submit formal requests for academic leave or campus outings. Multi-tier approval flows to Teacher and Principal.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.88rem' }}
              >
                <PlusCircle size={16} />
                <span>Submit Leave Request</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOutingModal(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.88rem' }}
              >
                <MapPin size={16} />
                <span>Submit Outing Permission</span>
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request Type</th>
                  <th>Date</th>
                  <th>Schedule / Periods</th>
                  <th>Reason & Destination</th>
                  <th>Teacher Approval</th>
                  <th>Principal Approval</th>
                  <th>Final Decision</th>
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
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.date}</td>
                    <td>
                      {p.type === 'LEAVE' 
                        ? `Periods ${p.start_period || 1} to ${p.end_period || 7}` 
                        : `${p.leaving_time} - ${p.expected_return_time}`}
                    </td>
                    <td>
                      <div style={{ color: '#fff', fontSize: '0.9rem' }}>{p.reason}</div>
                      {p.destination && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} /> {p.destination}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: p.teacher_approval === 'APPROVED' ? '#34d399' : p.teacher_approval === 'REJECTED' ? '#ef4444' : '#fbbf24' }}>
                        {p.teacher_approval}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: p.principal_approval === 'APPROVED' ? '#34d399' : p.principal_approval === 'REJECTED' ? '#ef4444' : '#fbbf24' }}>
                        {p.principal_approval}
                      </span>
                    </td>
                    <td>{getStatusBadge(p.final_status)}</td>
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No permission requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeNav === 'profile' && <ProfilePage />}

      {/* SETTINGS VIEW */}
      {activeNav === 'settings' && <SettingsPage />}

      {/* LEAVE REQUEST MODAL */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Submit Academic Leave Request</h3>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleLeaveSubmit}>
              <div className="input-group">
                <label className="input-label">Leave Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={leaveForm.date}
                  onChange={e => setLeaveForm({ ...leaveForm, date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">From Period</label>
                  <select className="form-control" value={leaveForm.startPeriod} onChange={e => setLeaveForm({ ...leaveForm, startPeriod: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (<option key={p} value={p}>Period {p}</option>))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">To Period</label>
                  <select className="form-control" value={leaveForm.endPeriod} onChange={e => setLeaveForm({ ...leaveForm, endPeriod: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (<option key={p} value={p}>Period {p}</option>))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Reason for Absence</label>
                <input type="text" className="form-control" placeholder="e.g. Medical illness, family emergency" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              </div>

              <div className="input-group">
                <label className="input-label">Optional Supporting Note</label>
                <textarea className="form-control" rows={3} placeholder="Add additional details or doctor note reference..." value={leaveForm.notes} onChange={e => setLeaveForm({ ...leaveForm, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit to Teacher & Principal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OUTING REQUEST MODAL */}
      {showOutingModal && (
        <div className="modal-overlay" onClick={() => setShowOutingModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Submit Campus Outing Permission</h3>
              <button onClick={() => setShowOutingModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleOutingSubmit}>
              <div className="input-group">
                <label className="input-label">Outing Date</label>
                <input type="date" className="form-control" value={outingForm.date} onChange={e => setOutingForm({ ...outingForm, date: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Leaving Time</label>
                  <input type="text" className="form-control" placeholder="02:00 PM" value={outingForm.leavingTime} onChange={e => setOutingForm({ ...outingForm, leavingTime: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Expected Return Time</label>
                  <input type="text" className="form-control" placeholder="05:30 PM" value={outingForm.expectedReturnTime} onChange={e => setOutingForm({ ...outingForm, expectedReturnTime: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Destination / Place</label>
                <input type="text" className="form-control" placeholder="e.g. Home, Central Library" value={outingForm.destination} onChange={e => setOutingForm({ ...outingForm, destination: e.target.value })} required />
              </div>

              <div className="input-group">
                <label className="input-label">Reason for Outing</label>
                <input type="text" className="form-control" placeholder="e.g. Personal work" value={outingForm.reason} onChange={e => setOutingForm({ ...outingForm, reason: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowOutingModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Outing Permission</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
