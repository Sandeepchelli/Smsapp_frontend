import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { 
  Banknote, Receipt, CheckCircle2, Clock, Search, 
  PlusCircle, Printer, Download, ArrowRight, UserCheck, AlertTriangle, Sparkles
} from 'lucide-react';

export default function CashierDashboard() {
  const { token, user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'fees', 'history', 'profile', 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cashier stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/cashier/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search students
  const searchStudents = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cashier/students?search=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        if (!selectedStudent && data.students.length > 0) {
          selectStudent(data.students[0].student_id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Select student and load fee ledger
  const selectStudent = async (studentId) => {
    try {
      const res = await fetch(`/api/cashier/student-fee/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedStudent(data.student);
        setFeeDetails(data.fee);
        setPayments(data.payments);
        setPaymentAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    searchStudents('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchStudents(searchQuery);
  };

  // Record payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const payVal = parseFloat(paymentAmount);
    if (payVal > feeDetails.pending_amount) {
      alert(`Amount exceeds current pending balance of ₹${feeDetails.pending_amount.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cashier/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.student_id,
          amount: payVal,
          paymentMethod,
          notes: paymentNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setStatusMessage(data.message);
      setReceiptModal({
        receiptNo: data.receiptNo,
        studentName: selectedStudent.student_name,
        rollNo: selectedStudent.roll_no,
        className: selectedStudent.class_name,
        amount: payVal,
        method: paymentMethod,
        date: new Date().toISOString().split('T')[0],
        totalFee: data.totalFee,
        paidAmount: data.paidAmount,
        pendingAmount: data.pendingAmount
      });

      // Reload
      fetchStats();
      selectStudent(selectedStudent.student_id);
      searchStudents(searchQuery);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navTitles = {
    dashboard: 'Cashier Dashboard',
    fees: 'Fee Collection Counter',
    history: 'Payment Receipts',
    profile: 'Cashier Profile',
    settings: 'Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Cashier Portal'}
      subtitle={`Welcome, ${user?.name} • College Accounts & Cashier Desk`}
      badgeCounts={{}}
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

      {/* CASHIER OPERATIONS */}
      {(activeNav === 'dashboard' || activeNav === 'fees' || activeNav === 'history') && (
        <>

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Receipt size={26} />
          </div>
          <div>
            <div className="stat-label">Total Fee Collected</div>
            <div className="stat-value">₹{(stats?.totalCollected || 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {stats?.totalTransactions || 0} Transactions Completed
            </div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-label">Outstanding Balance Across College</div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>₹{(stats?.totalPending || 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Pending Collections
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
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

      {/* 2-Column Layout: Search/Student List on Left, Fee Record & Collection on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Student Search & Selector */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Search Student</h3>
          
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px', paddingRight: '10px' }}
                placeholder="Name, Roll No, Dept..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
            {students.map(s => {
              const isSelected = selectedStudent?.student_id === s.student_id;
              return (
                <div
                  key={s.student_id}
                  onClick={() => selectStudent(s.student_id)}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{s.student_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 600 }}>Roll {s.roll_no}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {s.class_name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Pending:</span>
                    <span style={{ color: s.pending_amount > 0 ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
                      ₹{s.pending_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {students.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No students found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fee Details & New Payment Counter */}
        {selectedStudent && feeDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Student Fee Profile Header */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{selectedStudent.student_name}</h2>
                    <span className="badge badge-student">Roll #{selectedStudent.roll_no}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                    {selectedStudent.department} • Year {selectedStudent.year} (Semester {selectedStudent.semester}) • {selectedStudent.class_name}
                  </p>
                  {selectedStudent.parent_name && (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '2px' }}>
                      Linked Parent: <strong>{selectedStudent.parent_name}</strong> ({selectedStudent.parent_phone})
                    </p>
                  )}
                </div>
              </div>

              {/* Fee Breakdown Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL COURSE FEE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    ₹{feeDetails.total_fee?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ALREADY PAID</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                    ₹{feeDetails.paid_amount?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING BALANCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: feeDetails.pending_amount > 0 ? '#fbbf24' : '#34d399', marginTop: '4px' }}>
                    ₹{feeDetails.pending_amount?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Enter New Payment Form */}
            {feeDetails.pending_amount > 0 ? (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={20} color="#818cf8" />
                  <span>Enter New Payment</span>
                </h3>

                <form onSubmit={handleSavePayment}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Payment Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={`Max ₹${feeDetails.pending_amount}`}
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        max={feeDetails.pending_amount}
                        min={1}
                        required
                      />
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Payment Method</label>
                      <select
                        className="form-control"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI / QR Code</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Transaction Notes / Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Semester 5 Tuition installment, UPI Ref #..."
                      value={paymentNotes}
                      onChange={e => setPaymentNotes(e.target.value)}
                    />
                  </div>

                  {paymentAmount && parseFloat(paymentAmount) > 0 && (
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                      color: '#c7d2fe'
                    }}>
                      <strong>Live Calculation Preview:</strong> New Paid = ₹{(feeDetails.paid_amount + parseFloat(paymentAmount || 0)).toLocaleString()} | New Pending = ₹{Math.max(0, feeDetails.total_fee - (feeDetails.paid_amount + parseFloat(paymentAmount || 0))).toLocaleString()}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '10px' }}
                  >
                    <Banknote size={18} />
                    <span>{isSubmitting ? 'Processing Payment...' : `Save Payment & Generate Official Receipt`}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', textAlign: 'center', color: '#34d399' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '1.1rem' }}>All Fees Cleared</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>This student has zero pending balance for Semester 5.</p>
              </div>
            )}

            {/* Payment History Ledger */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Payment History Ledger</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Method</th>
                      <th>Cashier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Receipt size={14} /> {p.receipt_no}
                          </span>
                        </td>
                        <td style={{ color: '#fff' }}>{p.payment_date}</td>
                        <td style={{ fontWeight: 700, color: '#34d399' }}>₹{p.amount?.toLocaleString()}</td>
                        <td><span className="badge badge-secondary">{p.payment_method}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.cashier_name || user?.name}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                          No payment transactions recorded for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '18px', color: 'var(--text-dim)' }}>
            <Banknote size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem' }}>Select a Student</h3>
            <p style={{ fontSize: '0.85rem' }}>Choose a student from the list to view their fee ledger and collect payments.</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* PROFILE VIEW */}
      {activeNav === 'profile' && <ProfilePage />}

      {/* SETTINGS VIEW */}
      {activeNav === 'settings' && <SettingsPage />}

      {/* PRINTABLE RECEIPT MODAL */}
      {receiptModal && (
        <div className="modal-overlay" onClick={() => setReceiptModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{
              background: '#0f172a',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>EDUSPHERE</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official College Fee Collection Receipt</p>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  marginTop: '8px'
                }}>
                  RECEIPT #: {receiptModal.receiptNo}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{receiptModal.studentName} (Roll {receiptModal.rollNo})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Class:</span>
                  <span style={{ color: '#fff' }}>{receiptModal.className}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Date:</span>
                  <span style={{ color: '#fff' }}>{receiptModal.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <span style={{ color: '#fff' }}>{receiptModal.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Collected By:</span>
                  <span style={{ color: '#fff' }}>{user?.name} (Cashier)</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  marginTop: '8px',
                  fontSize: '1.15rem',
                  fontWeight: 800
                }}>
                  <span>Amount Paid:</span>
                  <span style={{ color: '#34d399' }}>₹{receiptModal.amount?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  <span>Remaining Pending Balance:</span>
                  <span style={{ color: '#fbbf24' }}>₹{receiptModal.pendingAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
