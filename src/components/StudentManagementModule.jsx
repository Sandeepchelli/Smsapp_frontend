import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Plus, Search, Filter, Edit3, Trash2, 
  CheckCircle2, XCircle, Shield, UserCheck, AlertTriangle, 
  X, Check, Mail, Phone, Users, RefreshCw, Eye, EyeOff, Lock, User, HeartHandshake
} from 'lucide-react';

export default function StudentManagementModule({ onDataChange }) {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Password visibility toggles
  const [showAddStudentPass, setShowAddStudentPass] = useState(false);
  const [showAddParentPass, setShowAddParentPass] = useState(false);
  const [showEditStudentPass, setShowEditStudentPass] = useState(false);
  const [showEditParentPass, setShowEditParentPass] = useState(false);

  // Add Form State
  const initialFormData = {
    name: '',
    username: '',
    password: '',
    rollNo: '',
    classId: '',
    email: '',
    phone: '',
    profilePhoto: '',
    totalFee: '',
    useExistingParent: false,
    parentId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelationship: 'Father',
    parentUsername: '',
    parentPassword: '',
    parentProfilePhoto: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  // Edit Form State
  const initialEditFormData = {
    name: '',
    username: '',
    password: '',
    rollNo: '',
    classId: '',
    email: '',
    phone: '',
    profilePhoto: '',
    parentId: '',
    parentName: '',
    parentUsername: '',
    parentPassword: '',
    parentPhone: '',
    parentEmail: '',
    parentRelationship: 'Father',
    parentProfilePhoto: ''
  };
  const [editFormData, setEditFormData] = useState(initialEditFormData);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studRes, classRes, parentRes] = await Promise.all([
        fetch(`/api/admin/students?search=${encodeURIComponent(searchQuery)}&classId=${classFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/classes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/parents', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (studRes.ok) setStudents((await studRes.json()).students);
      if (classRes.ok) {
        const cls = (await classRes.json()).classes;
        setClasses(cls);
        if (cls.length > 0 && !formData.classId) {
          setFormData(prev => ({ ...prev, classId: cls[0].id }));
        }
      }
      if (parentRes.ok) setParents((await parentRes.json()).parents);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, classFilter]);

  // Handle Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setShowAddModal(false);
      setFormData(initialFormData);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Edit Modal & Populate Form
  const handleOpenEdit = (s) => {
    setSelectedStudent(s);
    setEditFormData({
      name: s.name || '',
      username: s.username || '',
      password: '',
      rollNo: s.roll_no || '',
      classId: s.class_id || (classes[0]?.id || ''),
      email: s.email || '',
      phone: s.phone || '',
      profilePhoto: s.profile_photo || '',
      parentId: s.parent_id || '',
      parentName: s.parent_name || '',
      parentUsername: s.parent_username || '',
      parentPassword: '',
      parentPhone: s.parent_phone || '',
      parentEmail: s.parent_email || '',
      parentRelationship: s.relationship || s.parent_post || 'Father',
      parentProfilePhoto: s.parent_profile_photo || ''
    });
    setShowEditModal(true);
  };

  // Handle Edit Student
  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setShowEditModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle Active/Disabled Status
  const handleToggleStatus = async (student) => {
    const nextStatus = student.is_active ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/students/${student.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Confirm Delete Student
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeCount = students.filter(s => s.is_active).length;
  const disabledCount = students.filter(s => !s.is_active).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner & Actions */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Student Directory & Lifecycle Management</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Add new student admissions with linked parent accounts, manage credentials, and safely maintain records
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ borderRadius: '10px' }}
          >
            <Plus size={16} />
            <span>Admit New Student</span>
          </button>
        </div>

        {/* Quick stats mini-row */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total Enrolled: <strong style={{ color: '#fff' }}>{students.length}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#34d399' }}>
            Active Accounts: <strong>{activeCount}</strong>
          </div>
          {disabledCount > 0 && (
            <div style={{ fontSize: '0.85rem', color: '#ef4444' }}>
              Disabled Accounts: <strong>{disabledCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#34d399',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search student by Name, Roll No, User ID, Parent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '220px' }}
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
        >
          <option value="">All Degree Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Students Data Table */}
      <div className="glass-panel" style={{ borderRadius: '18px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Photo</th>
                <th>Full Name & Roll No</th>
                <th>Student User ID</th>
                <th>Assigned Class</th>
                <th>Linked Parent / Guardian</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ opacity: s.is_active ? 1 : 0.6 }}>
                  <td>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid var(--border-subtle)',
                      background: '#1e293b'
                    }}>
                      <img
                        src={s.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`}
                        alt={s.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{s.name}</div>
                    <code style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>Roll #{s.roll_no}</code>
                  </td>
                  <td>
                    <code style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '5px', color: '#c7d2fe', fontWeight: 600 }}>
                      {s.username}
                    </code>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.88rem', color: '#fff' }}>{s.class_name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Sec {s.section} • Year {s.year}</div>
                  </td>
                  <td>
                    {s.parent_name ? (
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{s.parent_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          ID: <code style={{ color: '#e0e7ff' }}>{s.parent_username || '—'}</code>
                          {s.relationship ? ` (${s.relationship})` : ''}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None Linked</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      {s.phone && <div>{s.phone}</div>}
                      {s.email && <div>{s.email}</div>}
                      {!s.phone && !s.email && <span>—</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-student' : 'badge-overdue'}`}>
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                        title="Edit Student & Parent Credentials"
                      >
                        <Edit3 size={13} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(s)}
                        className={`btn ${s.is_active ? 'btn-secondary' : 'btn-success'}`}
                        style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                        title={s.is_active ? 'Disable Student Login' : 'Enable Student Login'}
                      >
                        {s.is_active ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(s)}
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                        title="Delete Student"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No students match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMISSION MODAL (STUDENT + PARENT CREATION) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Admit New Student & Register Parent</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Create credentials, link parent details, assign class section, and set up fee ledger
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddStudent}>
              {/* SECTION 1: STUDENT INFORMATION & CREDENTIALS */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>
                  <User size={16} />
                  <span>1. Student Profile & Credentials</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Student Full Name *</label>
                    <input type="text" className="form-control" placeholder="e.g. Kiran Kumar" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Roll Number *</label>
                    <input type="text" className="form-control" placeholder="e.g. 106" value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Student User ID (Login) *</label>
                    <input type="text" className="form-control" placeholder="e.g. kiran106" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Student Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showAddStudentPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                        style={{ paddingRight: '38px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddStudentPass(!showAddStudentPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        {showAddStudentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Assign Class & Section *</label>
                    <select className="form-control" value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} required>
                      {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Initial Annual Fee (₹)</label>
                    <input type="number" className="form-control" value={formData.totalFee} onChange={e => setFormData({ ...formData, totalFee: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Student Email</label>
                    <input type="email" className="form-control" placeholder="kiran@student.college.edu" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Student Phone</label>
                    <input type="text" className="form-control" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Student Profile Photo URL (Optional)</label>
                  <input type="text" className="form-control" placeholder="https://..." value={formData.profilePhoto} onChange={e => setFormData({ ...formData, profilePhoto: e.target.value })} />
                </div>
              </div>

              {/* SECTION 2: PARENT / GUARDIAN DETAILS & CREDENTIALS */}
              <div style={{
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f472b6', fontWeight: 700, fontSize: '0.92rem' }}>
                    <HeartHandshake size={16} />
                    <span>2. Parent / Guardian Details & Credentials</span>
                  </div>

                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.useExistingParent}
                      onChange={e => setFormData({ ...formData, useExistingParent: e.target.checked })}
                    />
                    <span>Link Existing Registered Parent</span>
                  </label>
                </div>

                {formData.useExistingParent ? (
                  <div className="input-group">
                    <label className="input-label">Select Existing Parent Profile *</label>
                    <select className="form-control" value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: e.target.value })} required>
                      <option value="">-- Choose Existing Parent --</option>
                      {parents.map(p => (<option key={p.id} value={p.id}>{p.name} ({p.phone || p.username})</option>))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label className="input-label">Parent / Guardian Name *</label>
                        <input type="text" className="form-control" placeholder="e.g. Suresh Kumar" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Relationship with Student *</label>
                        <select className="form-control" value={formData.parentRelationship} onChange={e => setFormData({ ...formData, parentRelationship: e.target.value })} required>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label className="input-label">Parent User ID (Login) *</label>
                        <input type="text" className="form-control" placeholder="e.g. suresh_p" value={formData.parentUsername} onChange={e => setFormData({ ...formData, parentUsername: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Parent Password *</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showAddParentPass ? 'text' : 'password'}
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.parentPassword}
                            onChange={e => setFormData({ ...formData, parentPassword: e.target.value })}
                            required
                            style={{ paddingRight: '38px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowAddParentPass(!showAddParentPass)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                          >
                            {showAddParentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label className="input-label">Parent Phone Number</label>
                        <input type="text" className="form-control" placeholder="+91 98765 00000" value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Parent Email Address</label>
                        <input type="email" className="form-control" placeholder="parent@gmail.com" value={formData.parentEmail} onChange={e => setFormData({ ...formData, parentEmail: e.target.value })} />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Parent Profile Photo URL (Optional)</label>
                      <input type="text" className="form-control" placeholder="https://..." value={formData.parentProfilePhoto} onChange={e => setFormData({ ...formData, parentProfilePhoto: e.target.value })} />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Admit Student & Create Accounts</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT & PARENT CREDENTIALS MODAL */}
      {showEditModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Edit Student & Linked Parent Profile</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Update student and parent details, login User IDs, and security passwords
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEditStudent}>
              {/* STUDENT CREDENTIALS & DETAILS */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>
                  <User size={16} />
                  <span>Student Information & Login Credentials</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Student Full Name *</label>
                    <input type="text" className="form-control" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Roll Number *</label>
                    <input type="text" className="form-control" value={editFormData.rollNo} onChange={e => setEditFormData({ ...editFormData, rollNo: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Student User ID (Login) *</label>
                    <input type="text" className="form-control" value={editFormData.username} onChange={e => setEditFormData({ ...editFormData, username: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Change Student Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showEditStudentPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Leave empty to keep unchanged"
                        value={editFormData.password}
                        onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                        style={{ paddingRight: '38px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditStudentPass(!showEditStudentPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        {showEditStudentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Class</label>
                    <select className="form-control" value={editFormData.classId} onChange={e => setEditFormData({ ...editFormData, classId: e.target.value })} required>
                      {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Student Phone</label>
                    <input type="text" className="form-control" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Student Email</label>
                    <input type="email" className="form-control" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Student Profile Photo URL</label>
                    <input type="text" className="form-control" value={editFormData.profilePhoto} onChange={e => setEditFormData({ ...editFormData, profilePhoto: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* PARENT CREDENTIALS & DETAILS */}
              <div style={{
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f472b6', fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>
                  <HeartHandshake size={16} />
                  <span>Linked Parent / Guardian Information & Login Credentials</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Parent / Guardian Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Ramesh" value={editFormData.parentName} onChange={e => setEditFormData({ ...editFormData, parentName: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Relationship with Student</label>
                    <select className="form-control" value={editFormData.parentRelationship} onChange={e => setEditFormData({ ...editFormData, parentRelationship: e.target.value })}>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Parent User ID (Login)</label>
                    <input type="text" className="form-control" placeholder="parent user ID" value={editFormData.parentUsername} onChange={e => setEditFormData({ ...editFormData, parentUsername: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Change Parent Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showEditParentPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Leave empty to keep unchanged"
                        value={editFormData.parentPassword}
                        onChange={e => setEditFormData({ ...editFormData, parentPassword: e.target.value })}
                        style={{ paddingRight: '38px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditParentPass(!showEditParentPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        {showEditParentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Parent Phone Number</label>
                    <input type="text" className="form-control" value={editFormData.parentPhone} onChange={e => setEditFormData({ ...editFormData, parentPhone: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Parent Email Address</label>
                    <input type="email" className="form-control" value={editFormData.parentEmail} onChange={e => setEditFormData({ ...editFormData, parentEmail: e.target.value })} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Parent Profile Photo URL</label>
                  <input type="text" className="form-control" value={editFormData.parentProfilePhoto} onChange={e => setEditFormData({ ...editFormData, parentProfilePhoto: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Save All Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && studentToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '10px', borderRadius: '12px' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Confirm Student Removal</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permanent deletion of student profile & records</p>
              </div>
            </div>

            {/* Target Student Identity Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #ef4444',
                background: '#1e293b',
                flexShrink: 0
              }}>
                <img
                  src={studentToDelete.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentToDelete.username}`}
                  alt={studentToDelete.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{studentToDelete.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Roll #{studentToDelete.roll_no} • {studentToDelete.class_name || 'Class Assigned'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)', marginTop: '4px' }}>
                  User ID: <code>{studentToDelete.username}</code>
                  {studentToDelete.parent_name ? ` • Parent: ${studentToDelete.parent_name}` : ''}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              Are you sure you want to permanently delete this student? All linked attendance, exam results, permissions, and fee transaction logs will be removed. If their linked parent has no other enrolled children, the parent account will also be safely cleaned up without affecting any unrelated users.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} className="btn btn-danger">
                Permanently Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
