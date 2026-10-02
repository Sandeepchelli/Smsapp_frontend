import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { 
  Users, Calendar, Clock, CheckCircle2, AlertTriangle, 
  ShieldAlert, Banknote, FileText, HeartHandshake, Check, X,
  MapPin, Bell, Receipt, Award
} from 'lucide-react';

export default function ParentDashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'attendance', 'results', 'fees', 'permissions', 'profile', 'settings'

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, resRes] = await Promise.all([
          fetch('/api/parent/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/results/ward-results', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (dashRes.ok) setData(await dashRes.json());
        if (resRes.ok) setResultsData(await resRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-muted)' }}>
        Loading Parent & Guardian Portal...
      </div>
    );
  }

  const ward = data?.ward;
  const attendance = data?.attendance || { percentage: 0, records: [] };
  const fees = data?.fees || { total_fee: 0, paid_amount: 0, pending_amount: 0, history: [] };
  const permissions = data?.permissions || [];
  const notifications = data?.notifications || [];

  // Filter absence notifications
  const absenceAlerts = notifications.filter(n => n.type === 'ABSENCE_ALERT');

  const navTitles = {
    dashboard: 'Parent Dashboard',
    attendance: 'Child Attendance',
    results: 'Child Semester Results & Grades',
    fees: 'Fee Receipts',
    permissions: 'Leave Information',
    profile: 'Parent Profile',
    settings: 'Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Dashboard'}
      subtitle={ward ? `Monitoring: ${ward.student_name} • ${ward.class_name}` : 'Parent Portal'}
      badgeCounts={{}}
    >

      {/* DASHBOARD OVERVIEW */}
      {activeNav === 'dashboard' && (
        <div>
          {absenceAlerts.length > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5', marginBottom: '12px' }}><ShieldAlert size={22} /><h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fca5a5' }}>Real-Time Absence Alerts ({absenceAlerts.length})</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {absenceAlerts.slice(0, 3).map(a => (
                  <div key={a.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.88rem', color: '#fecaca', lineHeight: 1.45 }}>{a.message}</div>
                ))}
              </div>
            </div>
          )}
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}><HeartHandshake size={26} /></div><div><div className="stat-label">Ward</div><div className="stat-value" style={{ fontSize: '1.35rem' }}>{ward?.student_name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ward?.class_name} • Roll #{ward?.roll_no}</div></div></div>
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}><Calendar size={26} /></div><div><div className="stat-label">Attendance Rate</div><div className="stat-value" style={{ color: '#34d399' }}>{attendance.percentage}%</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{attendance.presentPeriods} Present</div></div></div>
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}><Award size={26} /></div><div><div className="stat-label">CGPA</div><div className="stat-value" style={{ color: '#facc15' }}>{resultsData?.overallCGPA || 'N/A'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Academic Grade</div></div></div>
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}><Banknote size={26} /></div><div><div className="stat-label">Pending Fees</div><div className="stat-value" style={{ color: fees.pending_amount > 0 ? '#fbbf24' : '#34d399' }}>₹{fees.pending_amount?.toLocaleString()}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>₹{fees.paid_amount?.toLocaleString()} Paid</div></div></div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Quick Navigation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {[['attendance','Child Attendance'],['results','Semester Results'],['fees','Fee Receipts'],['permissions','Leave Information']].map(([id,label]) => (
                <button key={id} type="button" onClick={() => setActiveNav(id)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '10px', fontSize: '0.85rem' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHILD ATTENDANCE */}
      {activeNav === 'attendance' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Ward's Period-wise Attendance</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Period</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.records.slice(0, 20).map((a, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{a.date}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>Period {a.period}</span></td>
                    <td>{a.subject_name}</td>
                    <td>
                      <span className={`badge badge-${a.status === 'Present' ? 'student' : a.status === 'On Leave' ? 'parent' : 'overdue'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.records.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No attendance records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WARD'S SEMESTER RESULTS */}
      {activeNav === 'results' && (
        <div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Ward's Academic Performance</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Official semester examination grades for {ward?.student_name} (Strictly Read-Only)
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cumulative GPA</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24' }}>
                  {resultsData?.overallCGPA || '9.44'} / 10.0
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
                        <th>Internal (30)</th>
                        <th>External (70)</th>
                        <th>Total (100)</th>
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
                          <td>{c.internal_marks}</td>
                          <td>{c.external_marks}</td>
                          <td style={{ fontWeight: 700, color: '#fff' }}>{c.total_marks}</td>
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
            {(!resultsData?.semesters || resultsData.semesters.length === 0) && (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No semester results published yet.
              </div>
            )}
          </div>
        </div>
      )}


      {/* FEES & PAYMENTS */}
      {activeNav === 'fees' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>School Fee Payments & Receipts</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Official payments recorded by College Cashier Desk (Read-Only)
              </p>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: fees.pending_amount > 0 ? '#fbbf24' : '#34d399' }}>
              Pending Balance: ₹{fees.pending_amount?.toLocaleString()}
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Payment Date</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Collected By</th>
                </tr>
              </thead>
              <tbody>
                {fees.history?.map((h, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Receipt size={14} /> {h.receipt_no}
                      </span>
                    </td>
                    <td style={{ color: '#fff' }}>{h.payment_date}</td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>₹{h.amount?.toLocaleString()}</td>
                    <td><span className="badge badge-secondary">{h.payment_method}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{h.cashier_name || 'Cashier Desk'}</td>
                  </tr>
                ))}
                {(!fees.history || fees.history.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No fee payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERMISSIONS */}
      {activeNav === 'permissions' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Leave & Outing Permissions</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Details</th>
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
                      <div style={{ fontSize: '0.88rem', color: '#fff' }}>{p.reason}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {p.type === 'LEAVE' ? `Periods ${p.start_period}-${p.end_period}` : `${p.leaving_time} - ${p.expected_return_time}`}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${p.final_status === 'APPROVED' ? 'student' : p.final_status === 'REJECTED' ? 'overdue' : 'parent'}`}>
                        {p.final_status === 'APPROVED' ? 'Permission Granted' : p.final_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No permission requests logged.
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
    </AppLayout>
  );
}
