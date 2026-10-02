import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';
import { 
  User, Mail, Phone, Building, Calendar, Award, Shield, 
  Lock, Edit3, CheckCircle2, AlertCircle, Users, BookOpen, 
  Layers, Clock, GraduationCap, HeartHandshake, Check, X, ShieldAlert
} from 'lucide-react';

export default function ProfilePage() {
  const { token, user: authUser, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setProfileData(data);
      setEditForm({
        email: data.user?.email || '',
        phone: data.user?.phone || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: editForm.email,
          phone: editForm.phone
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update contact info');

      setSuccessMsg('Contact information updated successfully!');
      setIsEditingContact(false);
      fetchProfile();
      if (updateUser && data.user) {
        updateUser(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading user profile details...
      </div>
    );
  }

  const { user, roleData } = profileData || {};
  const role = user?.role || authUser?.role;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Alert Messages */}
      {successMsg && (
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
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
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
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <img
              src={user?.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
              alt={user?.name}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '24px',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#10b981',
              border: '3px solid var(--bg-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} title="Active Account" />
          </div>

          {/* User Info Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {user?.name}
              </h2>
              <RoleBadge role={user?.role} />
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
              <span>ID / Username: <strong style={{ color: '#fff' }}>{user?.username}</strong></span>
              {roleData?.employeeId && (
                <span>• Employee ID: <strong style={{ color: '#fff' }}>{roleData.employeeId}</strong></span>
              )}
              {roleData?.rollNo && (
                <span>• Roll Number: <strong style={{ color: '#fff' }}>{roleData.rollNo}</strong></span>
              )}
              {user?.department && (
                <span>• Dept: <strong style={{ color: '#fff' }}>{user.department}</strong></span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                <Mail size={14} color="var(--primary-light)" /> {user?.email || 'No email provided'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                <Phone size={14} color="var(--primary-light)" /> {user?.phone || 'No phone registered'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => setIsEditingContact(!isEditingContact)}
            className={`btn ${isEditingContact ? 'btn-secondary' : 'btn-primary'}`}
            style={{ borderRadius: '12px', padding: '10px 18px' }}
          >
            <Edit3 size={16} />
            <span>{isEditingContact ? 'Cancel' : 'Edit Contact Details'}</span>
          </button>
        </div>

        {/* Contact Edit Form Modal / Accordion */}
        {isEditingContact && (
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '20px',
            borderRadius: '16px'
          }}>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={16} color="var(--primary-light)" />
              Update Contact Information
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Note: Academic records, role privileges, and identification numbers cannot be altered here.
            </p>
            <form onSubmit={handleUpdateContact} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. user@edusphere.edu"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +91 98765 43210"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-success"
                  style={{ borderRadius: '10px' }}
                >
                  {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 1. STUDENT SPECIFIC PROFILE VIEW */}
      {/* ==================================================== */}
      {role === 'Student' && roleData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Strict Restriction Warning */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Lock size={20} color="#60a5fa" />
            <div style={{ fontSize: '0.85rem', color: '#93c5fd' }}>
              <strong>Protected Academic Information:</strong> Roll number, class allocation, semester examinations, and fee records are officially verified and locked by College Administration.
            </div>
          </div>

          {/* Academic Overview Cards */}
          <div className="stat-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <GraduationCap size={26} />
              </div>
              <div>
                <div className="stat-label">Program & Class</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{roleData.className || 'B.Tech CSE'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Year {roleData.year} • Semester {roleData.semester} • Sec {roleData.section || 'A'}
                </div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="stat-label">Attendance Rate</div>
                <div className="stat-value" style={{ color: '#34d399' }}>{roleData.attendanceRate}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Compliant with 75% Board Rule
                </div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Award size={26} />
              </div>
              <div>
                <div className="stat-label">Cumulative CGPA</div>
                <div className="stat-value" style={{ color: '#fbbf24' }}>{roleData.cgpa}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Academic Distinction
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Student Academic & Parent Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Academic Information */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--primary-light)" />
                Academic Registration
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Roll Number</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{roleData.rollNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Department</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{roleData.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Enrolled Class</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{roleData.className}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Year & Semester</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Year {roleData.year} / Sem {roleData.semester}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Account Status</span>
                  <span className="badge badge-student" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>Active & Enrolled</span>
                </div>
              </div>
            </div>

            {/* Linked Parent Information */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartHandshake size={18} color="#f472b6" />
                Linked Parent / Guardian Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Parent Name</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{roleData.parent?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Relationship</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{roleData.parent?.relation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Emergency Phone</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{roleData.parent?.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Parent Email</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{roleData.parent?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>SMS Absence Alerts</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. PARENT SPECIFIC PROFILE VIEW */}
      {/* ==================================================== */}
      {role === 'Parent' && roleData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartHandshake size={22} color="#fbbf24" />
              Linked Student / Ward Profile
            </h3>

            {roleData.ward ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap'
              }}>
                <img
                  src={roleData.ward.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${roleData.ward.name}`}
                  alt={roleData.ward.name}
                  style={{ width: '80px', height: '80px', borderRadius: '18px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {roleData.ward.name}
                  </h4>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                    Roll Number: <strong style={{ color: '#fff' }}>{roleData.ward.rollNo}</strong> • Class: <strong style={{ color: '#fff' }}>{roleData.ward.className}</strong>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {roleData.ward.department} • Year {roleData.ward.year}
                  </div>
                </div>

                <span className="badge badge-parent" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  {roleData.relationship}
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No student currently linked to this parent profile.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. TEACHER SPECIFIC PROFILE VIEW */}
      {/* ==================================================== */}
      {role === 'Teacher' && roleData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Teacher Stats */}
          <div className="stat-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Building size={26} />
              </div>
              <div>
                <div className="stat-label">Faculty Department</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{roleData.department}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  ID: {roleData.employeeId}
                </div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Layers size={26} />
              </div>
              <div>
                <div className="stat-label">Assigned Classes</div>
                <div className="stat-value">{roleData.assignedClassesCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {roleData.assignedSubjectsCount} Subject Assignment(s)
                </div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="stat-label">Faculty Attendance</div>
                <div className="stat-value" style={{ color: '#34d399' }}>
                  {roleData.attendanceStats?.present_days || 0} Days
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {roleData.attendanceStats?.leave_days || 0} Days Approved Leave
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Classes and Subjects Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--primary-light)" />
              My Teaching Portfolio & Course Allocations
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                  </tr>
                </thead>
                <tbody>
                  {roleData.assignments?.map(a => (
                    <tr key={a.assignment_id}>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{a.class_name}</td>
                      <td><code style={{ color: 'var(--primary-light)' }}>{a.subject_code}</code></td>
                      <td style={{ fontWeight: 600 }}>{a.subject_name}</td>
                    </tr>
                  ))}
                  {(!roleData.assignments || roleData.assignments.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        No class assignments linked. Contact Academic Dean.
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
      {/* 4. ADMIN SPECIFIC PROFILE VIEW */}
      {/* ==================================================== */}
      {role === 'Admin' && roleData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#fbbf24" />
              Administrative Authority & System Roles
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ADMINISTRATIVE ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{roleData.adminId}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SYSTEM PRIVILEGES</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#34d399', marginTop: '4px' }}>Full Root Control</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>INSTITUTION</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>EduSphere</div>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '6px' }}>Security Policy</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                Admin access is audited. All student admission updates, fee transactions, teacher attendance marks, and permission approvals are timestamped with the administrator ID.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
