import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Users, Plus, Trash2, Search, Filter, 
  CheckCircle2, AlertCircle, Layers, Check, X, Shield, ArrowRight
} from 'lucide-react';

export default function TeacherSubjectManagementModule() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('All');

  // Modal for new assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    teacherId: '',
    classId: '',
    subjectId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentsData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/teacher-assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch assignments');

      setAssignments(data.assignments || []);
      setTeachers(data.teachers || []);
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);

      if (data.teachers?.length > 0 && !assignForm.teacherId) {
        setAssignForm(prev => ({
          ...prev,
          teacherId: data.teachers[0].id,
          classId: data.classes?.[0]?.id || '',
          subjectId: data.subjects?.[0]?.id || ''
        }));
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();
  }, [token]);

  // Handle assigning a teacher to subject & class
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/teacher-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: parseInt(assignForm.teacherId, 10),
          classId: parseInt(assignForm.classId, 10),
          subjectId: parseInt(assignForm.subjectId, 10)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create assignment');

      setStatusMessage(data.message || 'Subject assigned to faculty successfully.');
      setShowAssignModal(false);
      fetchAssignmentsData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle removing assignment
  const handleRemoveAssignment = async (assignmentId, teacherName, subjectName) => {
    if (!confirm(`Are you sure you want to remove assignment of "${subjectName}" from Prof. ${teacherName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/teacher-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message || 'Assignment deleted.');
      fetchAssignmentsData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Error removing assignment: ' + err.message);
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.subject_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeacher = selectedTeacherFilter === 'All' || String(a.teacher_id) === String(selectedTeacherFilter);
    return matchesSearch && matchesTeacher;
  });

  return (
    <div>
      {/* Alert Messages */}
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

      {/* Header & Stats Bar */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Faculty Subject & Class Allocation Manager
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Assign academic subjects and class sections to teaching faculty members.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="btn btn-primary"
            style={{ borderRadius: '12px', padding: '10px 20px' }}
          >
            <Plus size={18} />
            <span>Assign Subject to Teacher</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search faculty, subject, code, class..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <select
              className="form-control"
              value={selectedTeacherFilter}
              onChange={e => setSelectedTeacherFilter(e.target.value)}
            >
              <option value="All">All Faculty Members ({teachers.length})</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.department || 'Faculty'})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Active Allocations ({filteredAssignments.length})
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Each assignment grants the teacher attendance & marks authority for that class.
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Assigned Class</th>
                <th>Course / Subject</th>
                <th>Credits</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map(a => (
                <tr key={a.assignment_id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{a.teacher_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ID: {a.employee_id || `FAC-${a.teacher_id}`} • {a.teacher_dept || 'Academic Faculty'}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
                      {a.class_name}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Year {a.class_year} • Section {a.class_section}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{a.subject_name}</div>
                    <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {a.subject_code}
                    </code>
                  </td>

                  <td>
                    <span className="badge badge-secondary">{a.subject_credits || 3} Credits</span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignment(a.assignment_id, a.teacher_name, a.subject_name)}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        color: '#f87171',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                      }}
                      title="Unassign Subject"
                    >
                      <Trash2 size={14} />
                      <span>Unassign</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No subject allocations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* NEW ASSIGNMENT MODAL */}
      {/* ==================================================== */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Assign Course to Faculty Member
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="input-group">
                <label className="input-label">Select Teacher</label>
                <select
                  className="form-control"
                  value={assignForm.teacherId}
                  onChange={e => setAssignForm({ ...assignForm, teacherId: e.target.value })}
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department || 'Faculty'} • ID: {t.employee_id || t.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Select Target Class</label>
                <select
                  className="form-control"
                  value={assignForm.classId}
                  onChange={e => setAssignForm({ ...assignForm, classId: e.target.value })}
                  required
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Select Academic Subject</label>
                <select
                  className="form-control"
                  value={assignForm.subjectId}
                  onChange={e => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} • {s.credits} Credits)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ borderRadius: '10px' }}
                >
                  {submitting ? 'Saving Assignment...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
