import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { 
  Library, BookOpen, Plus, Search, CheckCircle2, Clock, 
  ArrowRight, Check, X, AlertTriangle, ShieldCheck, UserCheck, RefreshCw, BookMarked
} from 'lucide-react';

export default function LibrarianDashboard() {
  const { token, user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard', 'catalog', 'add-book', 'issued', 'returned', 'students'
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Forms
  const [bookForm, setBookForm] = useState({
    bookCode: '',
    title: '',
    author: '',
    category: 'Computer Science',
    isbn: '',
    totalQty: 5,
    shelfLocation: 'Shelf A-01'
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 14 days
  });

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      const [booksRes, loansRes, studentsRes] = await Promise.all([
        fetch(`/api/library/books?category=${categoryFilter}&search=${encodeURIComponent(searchQuery)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/library/active-loans?status=All', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/cashier/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (booksRes.ok) setBooks((await booksRes.json()).books);
      if (loansRes.ok) setLoans((await loansRes.json()).loans);
      if (studentsRes.ok) {
        const stdData = (await studentsRes.json()).students;
        setStudents(stdData);
        if (stdData.length > 0 && !issueForm.studentId) {
          setIssueForm(prev => ({ ...prev, studentId: stdData[0].student_id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, [categoryFilter, searchQuery]);

  // Add Book
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(`Book "${bookForm.title}" cataloged successfully!`);
      setShowAddBookModal(false);
      setBookForm({ bookCode: '', title: '', author: '', category: 'Computer Science', isbn: '', totalQty: 5, shelfLocation: 'Shelf A-01' });
      fetchLibraryData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Edit Book
  const handleEditBook = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      const res = await fetch(`/api/library/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(selectedBook)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage('Book details updated successfully.');
      setShowEditBookModal(false);
      fetchLibraryData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Issue Book
  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(issueForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setActiveNav('issued');
      fetchLibraryData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Return Book
  const handleReturnBook = async (loanId) => {
    if (!confirm('Confirm return of this book copy?')) return;
    try {
      const res = await fetch('/api/library/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ loanId, fineAmount: 0 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      fetchLibraryData();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeLoanCount = loans.filter(l => l.status === 'ISSUED').length;
  const totalBookCount = books.reduce((acc, b) => acc + b.total_qty, 0);

  const navTitles = {
    dashboard: 'Library Dashboard', catalog: 'Books Catalog', 'add-book': 'Add New Book',
    issued: 'Issued Books & Loans', returned: 'Returned Books', students: 'Student Records',
    profile: 'My Profile', settings: 'Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Library'}
      subtitle={`${books.length} Titles • ${activeLoanCount} Active Loans`}
      badgeCounts={{ activeLoans: activeLoanCount }}
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
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf' }}><BookOpen size={26} /></div><div><div className="stat-label">Total Titles</div><div className="stat-value">{books.length}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{totalBookCount} Physical Copies</div></div></div>
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}><BookMarked size={26} /></div><div><div className="stat-label">Active Loans</div><div className="stat-value" style={{ color: '#818cf8' }}>{activeLoanCount}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Books Out</div></div></div>
            <div className="glass-panel stat-card"><div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}><UserCheck size={26} /></div><div><div className="stat-label">Registered Students</div><div className="stat-value">{students.length}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>In System</div></div></div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Welcome, {user?.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {[['catalog','Books Catalog'],['add-book','Add New Book'],['issued','Issued Books'],['returned','Returned Books'],['students','Student Records']].map(([id,label]) => (
                <button key={id} type="button" onClick={() => setActiveNav(id)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '10px', fontSize: '0.85rem' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOOK CATALOG */}
      {(activeNav === 'catalog') && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Library Book Directory</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                View available inventory, shelf locations, and edit catalog metadata
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBookModal(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Catalog New Book</span>
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Search Title, Author, Code, Category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Code</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Shelf Location</th>
                  <th>Available / Total</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b.id}>
                    <td><code style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{b.book_code}</code></td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{b.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{b.author}</td>
                    <td><span className="badge badge-secondary">{b.category}</span></td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{b.shelf_location || 'General'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: b.available_qty > 0 ? '#34d399' : '#ef4444' }}>
                        {b.available_qty}
                      </span> / {b.total_qty} Copies
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBook(b);
                          setShowEditBookModal(true);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVE & RETURNED LOANS */}
      {(activeNav === 'issued' || activeNav === 'returned') && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Student Borrowing Ledger</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Loan #</th>
                  <th>Book Title</th>
                  <th>Student Name</th>
                  <th>Class / Roll</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{l.id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{l.book_title}</td>
                    <td>{l.student_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{l.class_name} (Roll {l.roll_no})</td>
                    <td>{l.issue_date}</td>
                    <td style={{ fontWeight: 600, color: '#fbbf24' }}>{l.due_date}</td>
                    <td>
                      <span className={`badge badge-${l.status === 'ISSUED' ? 'teacher' : 'student'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.status === 'ISSUED' ? (
                        <button
                          type="button"
                          onClick={() => handleReturnBook(l.id)}
                          className="btn btn-success"
                          style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                        >
                          <Check size={14} /> Process Return
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Returned ({l.return_date})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE BOOK (Add Book = 'add-book' nav) */}
      {(activeNav === 'add-book') && (
        <div style={{ marginBottom: '24px' }}>
          <button type="button" onClick={() => setShowAddBookModal(true)} className="btn btn-primary" style={{ marginBottom: '16px' }}><Plus size={16} /> Catalog New Book</button>
        </div>
      )}

      {/* ISSUE BOOK FORM */}
      {activeNav === 'students' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Issue Book to Student</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Select the recipient student and available book copy to register a new loan.
          </p>

          <form onSubmit={handleIssueBook}>
            <div className="input-group">
              <label className="input-label">Select Student</label>
              <select
                className="form-control"
                value={issueForm.studentId}
                onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })}
                required
              >
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_name} (Roll {s.roll_no} • {s.class_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Select Book (Available in Stock)</label>
              <select
                className="form-control"
                value={issueForm.bookId}
                onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })}
                required
              >
                <option value="">-- Choose Book --</option>
                {books.filter(b => b.available_qty > 0).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.book_code} • {b.available_qty} Available)
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Return Due Date</label>
              <input
                type="date"
                className="form-control"
                value={issueForm.dueDate}
                onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '10px' }}
            >
              <BookMarked size={18} />
              <span>Issue Book & Notify Student / Parent</span>
            </button>
          </form>
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeNav === 'profile' && <ProfilePage />}

      {/* SETTINGS VIEW */}
      {activeNav === 'settings' && <SettingsPage />}

      {/* ADD BOOK MODAL */}
      {showAddBookModal && (
        <div className="modal-overlay" onClick={() => setShowAddBookModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Catalog New Library Book</h3>
              <button onClick={() => setShowAddBookModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddBook}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Book Code / ID</label>
                  <input type="text" className="form-control" placeholder="e.g. BK-2001" value={bookForm.bookCode} onChange={e => setBookForm({ ...bookForm, bookCode: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Title</label>
                  <input type="text" className="form-control" placeholder="Book Title" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Author</label>
                  <input type="text" className="form-control" placeholder="Author Name" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input type="text" className="form-control" placeholder="e.g. Artificial Intelligence" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Total Quantity</label>
                  <input type="number" className="form-control" value={bookForm.totalQty} onChange={e => setBookForm({ ...bookForm, totalQty: e.target.value })} min={1} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Shelf Location</label>
                  <input type="text" className="form-control" placeholder="Shelf B-02" value={bookForm.shelfLocation} onChange={e => setBookForm({ ...bookForm, shelfLocation: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOOK MODAL */}
      {showEditBookModal && selectedBook && (
        <div className="modal-overlay" onClick={() => setShowEditBookModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Edit Book Information</h3>
              <button onClick={() => setShowEditBookModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEditBook}>
              <div className="input-group">
                <label className="input-label">Book Title</label>
                <input type="text" className="form-control" value={selectedBook.title} onChange={e => setSelectedBook({ ...selectedBook, title: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Author</label>
                  <input type="text" className="form-control" value={selectedBook.author} onChange={e => setSelectedBook({ ...selectedBook, author: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input type="text" className="form-control" value={selectedBook.category} onChange={e => setSelectedBook({ ...selectedBook, category: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Total Quantity</label>
                  <input type="number" className="form-control" value={selectedBook.total_qty} onChange={e => setSelectedBook({ ...selectedBook, total_qty: parseInt(e.target.value, 10) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Shelf Location</label>
                  <input type="text" className="form-control" value={selectedBook.shelf_location || ''} onChange={e => setSelectedBook({ ...selectedBook, shelf_location: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditBookModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Update Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
