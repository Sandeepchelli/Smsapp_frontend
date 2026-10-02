import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserPlus, Edit3, Trash2, Search, Filter,
  RefreshCw, Eye, EyeOff, AlertTriangle, X, Check,
  Car, Shield, UserCog, Briefcase, Sparkles, Wrench,
  Phone, Mail, Badge, Building2, KeyRound
} from 'lucide-react';

const STAFF_ROLES = ['Driver', 'Watchman', 'Attender', 'Attendant', 'Lab Technician', 'OfficeStaff', 'Cleaner', 'Other', 'Canteen', 'Cashier', 'Librarian'];

const ROLE_META = {
  Driver:     { label: 'Driver',              color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  icon: Car       },
  Watchman:   { label: 'Watchman / Security', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  icon: Shield    },
  Attender:   { label: 'Attender',            color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  icon: UserCog   },
  Attendant:  { label: 'Attendant',           color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  icon: UserCog   },
  'Lab Technician': { label: 'Lab Technician', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: Wrench   },
  OfficeStaff:{ label: 'Office Staff',        color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   icon: Briefcase },
  Cleaner:    { label: 'Cleaner',             color: '#10b981', bg: 'rgba(16,185,129,0.15)',  icon: Sparkles  },
  Other:      { label: 'Other Staff',         color: '#64748b', bg: 'rgba(100,116,139,0.15)', icon: Wrench    },
  Canteen:    { label: 'Canteen Staff',       color: '#f97316', bg: 'rgba(249,115,22,0.15)',  icon: Wrench    },
  Cashier:    { label: 'Cashier',             color: '#ec4899', bg: 'rgba(236,72,153,0.15)',  icon: Briefcase },
  Librarian:  { label: 'Librarian',           color: '#a855f7', bg: 'rgba(168,85,247,0.15)',  icon: Briefcase },
};

const EMPTY_FORM = {
  name: '', username: '', password: '', role: 'Driver', post: '',
  email: '', phone: '', employeeId: '', department: '', profilePhoto: ''
};

export default function StaffManagementModule({ token }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('success');

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [showAddPwd, setShowAddPwd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const notify = (msg, type = 'success') => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/staff?search=${encodeURIComponent(search)}`;
      if (roleFilter !== 'All') url += `&role=${encodeURIComponent(roleFilter)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      notify('Failed to load staff: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [search, roleFilter]);

  // ── ADD STAFF ──────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(data.message);
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      fetchStaff();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // ── EDIT STAFF ─────────────────────────────────────────────────────
  const openEdit = (s) => {
    setEditForm({
      id: s.id, name: s.name, username: s.username, password: '',
      role: s.role, post: s.post || '', email: s.email || '',
      phone: s.phone || '', employeeId: s.employee_id || '',
      department: s.department || '', profilePhoto: s.profile_photo || ''
    });
    setShowEdit(true);
    setShowEditPwd(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(data.message);
      setShowEdit(false);
      fetchStaff();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ── DELETE STAFF ───────────────────────────────────────────────────
  const openDelete = (s) => {
    setStaffToDelete(s);
    setDeleteConfirmName('');
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    if (deleteConfirmName.trim() !== staffToDelete.name.trim()) {
      notify('Name does not match. Please type the exact name to confirm.', 'error');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(data.message);
      setShowDelete(false);
      setStaffToDelete(null);
      notify(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleAccess = async (s) => {
    const newStatus = s.is_active === 0 ? 1 : 0;
    try {
      const res = await fetch(`/api/admin/staff/${s.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(data.message);
      fetchStaff();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const getRoleMeta = (role) => ROLE_META[role] || ROLE_META.Other;

  // ── FORM RENDERER (shared between add/edit) ───────────────────────
  const renderStaffForm = (form, setForm, showPwd, setShowPwd, onSubmit, loadingState, mode) => (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Ramesh Kumar" required />
        </div>
        <div>
          <label className="form-label">Employee ID</label>
          <input className="form-input" value={form.employeeId}
            onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
            placeholder="e.g. EMP-301" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Staff Role / Type *</label>
          <select className="form-input" value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))} required>
            {STAFF_ROLES.map(r => (
              <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Post / Designation *</label>
          <input className="form-input" value={form.post}
            onChange={e => setForm(p => ({ ...p, post: e.target.value }))}
            placeholder="e.g. Senior Driver" required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">User ID (Login) *</label>
          <input className="form-input" value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            placeholder="Unique login ID" required />
        </div>
        <div>
          <label className="form-label">{mode === 'edit' ? 'New Password (leave blank to keep)' : 'Password *'}</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Set a strong password'}
              required={mode === 'add'}
              style={{ paddingRight: '40px' }}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Mobile Number</label>
          <input className="form-input" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+91 99999 99999" />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="staff@college.edu" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Department</label>
          <input className="form-input" value={form.department}
            onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            placeholder="e.g. Transport, Security" />
        </div>
        <div>
          <label className="form-label">Profile Photo URL</label>
          <input className="form-input" value={form.profilePhoto}
            onChange={e => setForm(p => ({ ...p, profilePhoto: e.target.value }))}
            placeholder="https://..." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary"
          onClick={() => mode === 'add' ? setShowAdd(false) : setShowEdit(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loadingState}>
          {loadingState ? 'Saving...' : mode === 'add' ? 'Create Staff Account' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Status Banner */}
      {statusMsg && (
        <div style={{
          padding: '12px 18px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600,
          background: statusType === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
          color: statusType === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${statusType === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {statusType === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {statusMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input className="form-input" style={{ paddingLeft: '36px' }}
              placeholder="Search staff by name, ID, post..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-dim)" />
            <select className="form-input" style={{ width: '160px' }}
              value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              {STAFF_ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
            </select>
          </div>
          <button type="button" className="btn btn-secondary" onClick={fetchStaff} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { setAddForm(EMPTY_FORM); setShowAdd(true); }}>
          <UserPlus size={16} /> Add Staff Member
        </button>
      </div>

      {/* Staff Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading staff directory...</div>
      ) : staff.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', borderRadius: '16px', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No staff members found.</p>
          <p style={{ fontSize: '0.82rem', margin: '6px 0 0' }}>Click "Add Staff Member" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '14px' }}>
          {staff.map(s => {
            const m = getRoleMeta(s.role);
            const RoleIco = m.icon;
            const avatar = s.profile_photo ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`;
            return (
              <div key={s.id} className="glass-panel" style={{
                padding: '18px', borderRadius: '16px',
                borderTop: `3px solid ${m.color}50`,
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                {/* Card Header */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <img src={avatar} alt={s.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', background: m.bg, flexShrink: 0 }}
                    onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.96rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.post}</div>
                    <div style={{ marginTop: '5px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '99px', background: m.bg, color: m.color, fontSize: '0.72rem', fontWeight: 700 }}>
                        <RoleIco size={11} /> {m.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <Badge size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>ID: <span style={{ color: 'var(--text-muted)' }}>{s.username}</span></span>
                    {s.employee_id && <span style={{ marginLeft: '8px' }}>Emp: {s.employee_id}</span>}
                  </div>
                  {s.phone && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      <Phone size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      <Mail size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</span>
                    </div>
                  )}
                  {s.department && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      <Building2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{s.department}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                  <button type="button"
                    onClick={() => handleToggleAccess(s)}
                    className="btn btn-secondary"
                    title={s.is_active === 0 ? 'Account is disabled. Click to enable access.' : 'Account is active. Click to disable access.'}
                    style={{
                      fontSize: '0.75rem', padding: '6px 10px',
                      color: s.is_active === 0 ? '#f87171' : '#34d399',
                      borderColor: s.is_active === 0 ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'
                    }}>
                    {s.is_active === 0 ? 'Disabled' : 'Active'}
                  </button>
                  <button type="button" className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '7px 0' }}
                    onClick={() => openEdit(s)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button type="button" className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '7px 0', color: '#f87171', borderColor: 'rgba(248,113,113,0.25)' }}
                    onClick={() => openDelete(s)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD MODAL ─────────────────────────────────────────────────── */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', borderRadius: '20px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                <UserPlus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Add New Staff Member
              </h3>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>
            {renderStaffForm(addForm, setAddForm, showAddPwd, setShowAddPwd, handleAdd, addLoading, 'add')}
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ────────────────────────────────────────────────── */}
      {showEdit && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', borderRadius: '20px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                <Edit3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Edit Staff Member
              </h3>
              <button type="button" onClick={() => setShowEdit(false)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>
            {renderStaffForm(editForm, setEditForm, showEditPwd, setShowEditPwd, handleEdit, editLoading, 'edit')}
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────── */}
      {showDelete && staffToDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} color="#f87171" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Remove Staff Member</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>This action cannot be undone</p>
              </div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '18px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Deleting <strong style={{ color: '#fff' }}>{staffToDelete.name}</strong> ({staffToDelete.role}) will permanently remove their account and all attendance records.
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label">Type <strong style={{ color: '#f87171' }}>{staffToDelete.name}</strong> to confirm:</label>
              <input className="form-input" value={deleteConfirmName}
                onChange={e => setDeleteConfirmName(e.target.value)}
                placeholder="Type exact name to confirm" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => { setShowDelete(false); setStaffToDelete(null); }}>
                Cancel
              </button>
              <button type="button" disabled={deleteLoading || deleteConfirmName.trim() !== staffToDelete.name.trim()}
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
                  background: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                  cursor: deleteConfirmName.trim() === staffToDelete.name.trim() ? 'pointer' : 'not-allowed',
                  opacity: deleteConfirmName.trim() === staffToDelete.name.trim() ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                <Trash2 size={15} /> {deleteLoading ? 'Removing...' : 'Remove Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
