import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';
import AppLayout from '../components/AppLayout';
import StudentManagementModule from '../components/StudentManagementModule';
import CanteenModule from '../components/CanteenModule';
import TeacherAttendanceModule from '../components/TeacherAttendanceModule';
import TeacherSubjectManagementModule from '../components/TeacherSubjectManagementModule';
import StaffManagementModule from '../components/StaffManagementModule';
import StaffAttendanceModule from '../components/StaffAttendanceModule';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { 
  Users, UserPlus, Shield, Edit3, Trash2, Search, Filter, 
  CheckCircle2, RefreshCw, AlertCircle, Sparkles, Building, Landmark,
  BookOpen, Check, X, Clock, MapPin, Plus, GraduationCap, Send,
  Award, CalendarDays, BookMarked, Library, Calendar, CheckSquare,
  Eye, EyeOff, AlertTriangle, KeyRound, Lock
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, user: currentUser } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard'); 
  // 'dashboard','students','parents','teachers','subjects','timetable','attendance','results','library','canteen','fees','users','settings'

  // Core Data
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resultsList, setResultsList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');

  // Selected filters for timetable & results
  const [selectedTimetableClassId, setSelectedTimetableClassId] = useState('');
  const [selectedResultsClassId, setSelectedResultsClassId] = useState('');

  // Modals State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddTimetableModal, setShowAddTimetableModal] = useState(false);
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showDeleteTeacherModal, setShowDeleteTeacherModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [showEditTeacherPass, setShowEditTeacherPass] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [editTeacherFormData, setEditTeacherFormData] = useState({
    id: '', name: '', username: '', password: '', employeeId: '', department: '', post: '', email: '', phone: '', profilePhoto: '', assignments: []
  });

  // Forms State
  const [userFormData, setUserFormData] = useState({
    name: '', username: '', password: '', role: 'Teacher', post: '', email: '', phone: ''
  });

  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    username: '',
    password: '',
    employeeId: '',
    department: '',
    post: 'Teacher',
    email: '',
    phone: '',
    profilePhoto: '',
    classId: '',
    subjectId: ''
  });

  const [editRole, setEditRole] = useState('Teacher');
  const [editPost, setEditPost] = useState('');

  const [classForm, setClassForm] = useState({
    name: '', department: '', year: 1, section: 'A', semester: 1
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '', name: '', department: ''
  });

  const [assignForm, setAssignForm] = useState({
    teacherId: '', classId: '', subjectId: ''
  });

  const [timetableForm, setTimetableForm] = useState({
    classId: '', subjectId: '', teacherId: '', day: 'Monday', period: 1, startTime: '09:00 AM', endTime: '09:50 AM', roomNo: ''
  });

  const [resultForm, setResultForm] = useState({
    studentId: '', semester: 1, subjectId: '', internalMarks: '', externalMarks: '', credits: 3
  });

  const [bookForm, setBookForm] = useState({
    title: '', author: '', isbn: '', category: '', totalCopies: 1, shelfLocation: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        usersRes, statsRes, permsRes, classesRes, subjectsRes, teachersRes, studentsRes, resultsRes, booksRes, loansRes
      ] = await Promise.all([
        fetch(`/api/admin/users?role=${roleFilter}&search=${encodeURIComponent(searchQuery)}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/permissions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/classes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/subjects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/teachers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/students', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/results/all', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/library/books', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/library/active-loans', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (usersRes.ok) setUsers((await usersRes.json()).users);
      if (statsRes.ok) setStats(await statsRes.json());
      if (permsRes.ok) setPermissions((await permsRes.json()).requests);
      if (teachersRes.ok) setTeachers((await teachersRes.json()).teachers);
      if (studentsRes.ok) {
        const studs = (await studentsRes.json()).students;
        setStudents(studs);
        if (studs.length > 0 && !resultForm.studentId) {
          setResultForm(prev => ({ ...prev, studentId: studs[0].id }));
        }
      }
      if (resultsRes.ok) setResultsList((await resultsRes.json()).results);
      if (booksRes.ok) setBooksList((await booksRes.json()).books);
      if (loansRes.ok) setActiveLoans((await loansRes.json()).loans);

      if (classesRes.ok) {
        const cls = (await classesRes.json()).classes;
        setClasses(cls);
        if (cls.length > 0) {
          if (!assignForm.classId) setAssignForm(prev => ({ ...prev, classId: cls[0].id }));
          if (!selectedTimetableClassId) setSelectedTimetableClassId(cls[0].id);
          if (!timetableForm.classId) setTimetableForm(prev => ({ ...prev, classId: cls[0].id }));
          if (!teacherFormData.classId) setTeacherFormData(prev => ({ ...prev, classId: cls[0].id }));
        }
      }

      if (subjectsRes.ok) {
        const subs = (await subjectsRes.json()).subjects;
        setSubjects(subs);
        if (subs.length > 0) {
          if (!assignForm.subjectId) setAssignForm(prev => ({ ...prev, subjectId: subs[0].id }));
          if (!timetableForm.subjectId) setTimetableForm(prev => ({ ...prev, subjectId: subs[0].id }));
          if (!resultForm.subjectId) setResultForm(prev => ({ ...prev, subjectId: subs[0].id }));
          if (!teacherFormData.subjectId) setTeacherFormData(prev => ({ ...prev, subjectId: subs[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableForClass = async (classId) => {
    if (!classId) return;
    try {
      const res = await fetch(`/api/timetable/class/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimetableSlots(data.timetable || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    if (selectedTimetableClassId) {
      fetchTimetableForClass(selectedTimetableClassId);
    }
  }, [selectedTimetableClassId]);

  // Principal decision
  const handlePrincipalDecision = async (id, action) => {
    try {
      const res = await fetch(`/api/admin/permissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, comments: 'Decision finalized by Principal' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Teacher with immediate assignment
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(teacherFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(`Faculty ${teacherFormData.name} created and assigned!`);
      setShowAddTeacherModal(false);
      setTeacherFormData({
        name: '', username: '', password: '', employeeId: '', department: 'Computer Science & Engineering',
        post: 'Assistant Professor', email: '', phone: '',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        classId: classes[0]?.id || '', subjectId: subjects[0]?.id || ''
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Edit Teacher
  const handleEditTeacherSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/teachers/${editTeacherFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editTeacherFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message || 'Teacher profile & credentials updated successfully!');
      setShowEditTeacherModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Teacher Delete Confirmation Modal
  const handleOpenDeleteTeacher = (t) => {
    setTeacherToDelete(t);
    setShowDeleteTeacherModal(true);
  };

  // Confirm Delete Teacher
  const handleConfirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      const res = await fetch(`/api/admin/teachers/${teacherToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStatusMessage(data.message || 'Teacher removed successfully.');
      setShowDeleteTeacherModal(false);
      setTeacherToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Timetable Slot
  const handleAddTimetableSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(timetableForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage('Timetable lecture slot scheduled successfully!');
      setShowAddTimetableModal(false);
      fetchTimetableForClass(selectedTimetableClassId);
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Timetable Slot
  const handleDeleteTimetableSlot = async (id) => {
    if (!confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      const res = await fetch(`/api/timetable/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete slot');
      fetchTimetableForClass(selectedTimetableClassId);
    } catch (err) {
      alert(err.message);
    }
  };

  // Add / Publish Result
  const handleAddResult = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(resultForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage('Semester Result recorded and published!');
      setShowAddResultModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Result
  const handleDeleteResult = async (id) => {
    if (!confirm('Are you sure you want to delete this result entry?')) return;
    try {
      const res = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete result');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

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

      setStatusMessage(`Book '${bookForm.title}' added to central library catalog!`);
      setShowAddBookModal(false);
      setBookForm({ title: '', author: '', isbn: '', category: 'Computer Science', totalCopies: 5, shelfLocation: 'Rack B-12' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(`User '${userFormData.name}' created with role '${userFormData.role}'!`);
      setShowCreateUserModal(false);
      setUserFormData({ name: '', username: '', password: '', role: 'Teacher', post: '', email: '', phone: '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Update Role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: editRole, post: editPost })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setShowEditRoleModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Create Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(classForm)
      });
      if (!res.ok) throw new Error('Failed to create class');
      setStatusMessage(`Class '${classForm.name}' created successfully!`);
      setShowCreateClassModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(subjectForm)
      });
      if (!res.ok) throw new Error('Failed to create subject');
      setStatusMessage(`Subject '${subjectForm.name}' created!`);
      setShowCreateSubjectModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Assign Teacher
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(assignForm)
      });
      if (!res.ok) throw new Error('Failed to assign teacher');
      setStatusMessage('Teacher assigned to class & subject successfully!');
      setShowAssignTeacherModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Nav title helper
  const navTitles = {
    dashboard: 'Admin Dashboard', students: 'Student Management', parents: 'Parent Records',
    teachers: 'Faculty & Assignments', 'teacher-attendance': 'Teacher Attendance Desk',
    'teacher-subjects': 'Teacher Subject Allocation', subjects: 'Classes & Subjects',
    timetable: 'Timetable Builder', attendance: 'Attendance Desk', results: 'Semester Results',
    library: 'Central Library', canteen: 'College Canteen', fees: 'Tuition Fees',
    users: 'User Accounts & Roles', profile: 'Admin Profile', settings: 'System Settings'
  };

  return (
    <AppLayout
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      title={navTitles[activeNav] || 'Admin Panel'}
      subtitle={`EduSphere — ${currentUser?.name || ''}`}
      badgeCounts={{ students: students.length, pendingPerms: permissions.filter(p => p.principal_approval === 'PENDING').length }}
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
          <div className="stat-grid" style={{ marginBottom: '28px' }}>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}><Users size={24} /></div>
              <div><div className="stat-label">Total Users</div><div className="stat-value">{stats?.totalUsers || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{stats?.teachers || 0} Faculty • {stats?.students || 0} Students</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}><Clock size={24} /></div>
              <div><div className="stat-label">Pending Approvals</div><div className="stat-value" style={{ color: '#fbbf24' }}>{stats?.pendingPermissions || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Awaiting Principal</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}><Building size={24} /></div>
              <div><div className="stat-label">College Sections</div><div className="stat-value">{stats?.classes || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Active Degree Classes</div></div>
            </div>
            <div className="glass-panel stat-card">
              <div className="stat-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}><Landmark size={24} /></div>
              <div><div className="stat-label">Fee Collection</div><div className="stat-value">₹{(stats?.totalCollected || 0).toLocaleString()}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>₹{(stats?.totalPending || 0).toLocaleString()} Dues</div></div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Quick Navigation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {[['students','Student Management'],['teachers','Faculty Directory'],['subjects','Classes & Subjects'],['timetable','Timetable Builder'],['results','Semester Results'],['library','Central Library'],['canteen','Canteen Management'],['users','User Accounts'],['attendance','Attendance Desk']].map(([id,label]) => (
                <button key={id} type="button" onClick={() => setActiveNav(id)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '12px' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT MANAGEMENT MODULE */}
      {activeNav === 'students' && <StudentManagementModule />}

      {/* PRINCIPAL PERMISSIONS APPROVAL */}
      {activeNav === 'attendance' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Principal Leave & Outing Authorization Desk</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Grant final institutional approval for student requests. When accepted, final status updates to <strong>PERMISSION GRANTED</strong> and triggers notifications for both Student and Parent.
            </p>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Student Name</th>
                  <th>Class / Roll</th>
                  <th>Date & Schedule</th>
                  <th>Reason / Destination</th>
                  <th>Teacher Review</th>
                  <th>Final Decision</th>
                  <th style={{ textAlign: 'right' }}>Final Authorization</th>
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
                        {p.type === 'LEAVE' ? `Periods ${p.start_period || 1}-${p.end_period || 7}` : `${p.leaving_time} - ${p.expected_return_time}`}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem', color: '#fff' }}>{p.reason}</div>
                      {p.destination && <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>Dest: {p.destination}</div>}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: p.teacher_approval === 'APPROVED' ? '#34d399' : p.teacher_approval === 'REJECTED' ? '#ef4444' : '#fbbf24' }}>
                        {p.teacher_approval}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.final_status === 'APPROVED' ? 'student' : p.final_status === 'REJECTED' ? 'overdue' : 'parent'}`}>
                        {p.final_status === 'APPROVED' ? 'Permission Granted' : p.final_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {p.principal_approval === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handlePrincipalDecision(p.id, 'ACCEPT')}
                            className="btn btn-success"
                            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            <Check size={14} /> Accept & Grant
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrincipalDecision(p.id, 'REJECT')}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Decision Finalized
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No permission requests submitted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHER MANAGEMENT */}
      {activeNav === 'teachers' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Faculty Directory & Immediate Subject Assignments</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Add new teachers with Employee IDs, Profile Photos, and instantly assign their teaching classes & subjects.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAssignTeacherModal(true)}
                className="btn btn-secondary"
              >
                <BookOpen size={16} />
                <span>Assign Existing Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Faculty & Assign Subject</span>
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Faculty Photo</th>
                  <th>Teacher Name & Emp ID</th>
                  <th>Department & Post</th>
                  <th>Login Username</th>
                  <th>Assigned Classes & Subjects</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--primary-light)',
                        background: '#1e293b'
                      }}>
                        <img
                          src={t.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.username}`}
                          alt={t.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{t.name}</div>
                      <code style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>EMP: {t.employee_id || `FAC-${t.id}`}</code>
                    </td>
                    <td>
                      <div style={{ color: '#fff' }}>{t.department || 'General Faculty'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.post || 'Professor'}</div>
                    </td>
                    <td>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: '#c7d2fe' }}>
                        {t.username}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {t.assignments?.map(a => (
                          <div key={a.assignment_id} style={{
                            fontSize: '0.78rem',
                            background: 'rgba(59, 130, 246, 0.12)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: '#93c5fd'
                          }}>
                            <strong>{a.class_name}</strong>: {a.subject_name} ({a.subject_code})
                          </div>
                        ))}
                        {(!t.assignments || t.assignments.length === 0) && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No active assignments</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      {t.phone && <div>{t.phone}</div>}
                      {t.email && <div>{t.email}</div>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditTeacherFormData({
                              id: t.id,
                              name: t.name,
                              username: t.username || '',
                              password: '',
                              employeeId: t.employee_id || '',
                              department: t.department || '', 
                              post: t.post || '',
                              email: t.email || '',
                              phone: t.phone || '',
                              profilePhoto: t.profile_photo || '',
                              assignments: t.assignments || []
                            });
                            setShowEditTeacherPass(false);
                            setShowEditTeacherModal(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteTeacher(t)}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No faculty members added yet. Click "+ Add New Teacher" above to register faculty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TIMETABLE BUILDER */}
      {activeNav === 'timetable' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Weekly Class Timetable Builder</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Create and manage day-wise period schedules for classes, subjects, faculty, and lecture halls.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                className="form-control"
                style={{ width: '250px' }}
                value={selectedTimetableClassId}
                onChange={e => setSelectedTimetableClassId(e.target.value)}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddTimetableModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Timetable Slot</span>
              </button>
            </div>
          </div>

          {/* Timetable Schedule Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {daysOfWeek.map(day => {
              const daySlots = timetableSlots.filter(t => t.day === day);
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
                        padding: '12px 14px',
                        position: 'relative'
                      }}>
                        <button
                          onClick={() => handleDeleteTimetableSlot(s.id)}
                          title="Delete slot"
                          style={{
                            position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', paddingRight: '16px' }}>
                          <span style={{ fontWeight: 700, color: '#fbbf24' }}>Period {s.period}</span>
                          <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{s.room_no}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{s.subject_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: '2px' }}>{s.teacher_name}</div>
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

      {/* SEMESTER RESULTS MANAGER */}
      {activeNav === 'results' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Semester Examination Results & Grade Cards</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Publish semester marks (internal & external), calculate CGPA, and notify students and linked parents.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddResultModal(true)}
              className="btn btn-primary"
            >
              <Award size={16} />
              <span>Publish / Record Result</span>
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Semester</th>
                  <th>Course</th>
                  <th>Internal (30)</th>
                  <th>External (70)</th>
                  <th>Total (100)</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {resultsList.map(r => (
                  <tr key={r.id}>
                    <td><strong style={{ color: 'var(--primary-light)' }}>{r.roll_no}</strong></td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{r.student_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.class_name}</td>
                    <td>Semester {r.semester}</td>
                    <td>{r.subject_name} (<code style={{ fontSize: '0.75rem' }}>{r.subject_code}</code>)</td>
                    <td>{r.internal_marks}</td>
                    <td>{r.external_marks}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{r.total_marks}</td>
                    <td><span className="badge badge-student">{r.grade}</span></td>
                    <td>
                      <span className={`badge badge-${r.status === 'PASS' ? 'student' : 'overdue'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteResult(r.id)}
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {resultsList.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No semester results recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIBRARY MANAGEMENT */}
      {activeNav === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Central Library Catalog ({booksList.length} Titles)</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Books repository, copy tracking, and shelf locations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBookModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Book to Catalog</span>
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Book Code</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Available / Total Copies</th>
                    <th>Shelf Location</th>
                  </tr>
                </thead>
                <tbody>
                  {booksList.map(b => (
                    <tr key={b.id}>
                      <td><code style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{b.code}</code></td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{b.title}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{b.author}</td>
                      <td><span className="badge badge-secondary">{b.category}</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: b.available_copies > 0 ? '#34d399' : '#ef4444' }}>
                          {b.available_copies}
                        </span> / {b.total_copies}
                      </td>
                      <td style={{ color: 'var(--text-dim)' }}>{b.shelf_location || 'General'}</td>
                  </tr>
                ))}
                {booksList.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No library books cataloged yet. Click "Add Book to Catalog" above to add books.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Active Book Loans ({activeLoans.length})</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Student Name</th>
                    <th>Class / Roll</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{l.book_title}</td>
                      <td>{l.student_name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{l.class_name} ({l.roll_no})</td>
                      <td>{l.issue_date}</td>
                      <td><span style={{ color: '#fbbf24', fontWeight: 700 }}>{l.due_date}</span></td>
                      <td><span className="badge badge-parent">Active Loan</span></td>
                    </tr>
                  ))}
                  {activeLoans.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No active book loans.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER ACCOUNTS & ROLES */}
      {activeNav === 'users' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>User Accounts & Role Assignments</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Admin assigns user roles in the database. When users log in, the system automatically detects their role.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateUserModal(true)}
              className="btn btn-primary"
            >
              <UserPlus size={18} />
              <span>Create New User</span>
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
                placeholder="Search by Name, Username, Post..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Librarian">Librarian</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
              <option value="Cashier">Cashier</option>
            </select>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Designated Post / Title</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{u.id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{u.name}</td>
                    <td><code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: '#c7d2fe' }}>{u.username}</code></td>
                    <td><RoleBadge role={u.role} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.post}</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-dim)' }}>{u.phone || u.email || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setEditRole(u.role);
                          setEditPost(u.post);
                          setShowEditRoleModal(true);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        <Edit3 size={14} /> Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No user accounts found. Click "Create New User" to register accounts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASSES & SUBJECTS */}
      {activeNav === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Classes Panel */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>College Classes ({classes.length})</h3>
              <button
                type="button"
                onClick={() => setShowCreateClassModal(true)}
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> Add Class
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {classes.map(c => (
                <div key={c.id} style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px'
                }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {c.department} • Year {c.year} (Sem {c.semester})
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--primary-light)' }}>
                    <span>{c.student_count || 0} Students</span>
                    <span>•</span>
                    <span>{c.assignment_count || 0} Subjects Assigned</span>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No classes created yet. Click "+ Add Class" to set up academic classes.
                </div>
              )}
            </div>
          </div>

          {/* Subjects Panel */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Curriculum Subjects ({subjects.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateSubjectModal(true)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Subject
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignTeacherModal(true)}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <GraduationCap size={14} /> Assign Faculty
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subjects.map(s => (
                <div key={s.id} style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.department}</div>
                  </div>
                  <code style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {s.code}
                  </code>
                </div>
              ))}
              {subjects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No curriculum subjects added yet. Click "+ Add Subject" to add courses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CANTEEN MODULE */}
      {activeNav === 'canteen' && <CanteenModule mode="staff" />}

      {/* STAFF MANAGEMENT MODULE */}
      {activeNav === 'staff' && <StaffManagementModule token={token} />}

      {/* STAFF ATTENDANCE MODULE */}
      {activeNav === 'staff-attendance' && <StaffAttendanceModule token={token} />}

      {/* TEACHER ATTENDANCE MODULE */}
      {activeNav === 'teacher-attendance' && <TeacherAttendanceModule />}

      {/* TEACHER SUBJECT ALLOCATION MODULE */}
      {activeNav === 'teacher-subjects' && <TeacherSubjectManagementModule />}

      {/* ADMIN PROFILE */}
      {activeNav === 'profile' && <ProfilePage />}

      {/* SYSTEM SETTINGS */}
      {activeNav === 'settings' && <SettingsPage />}

      {/* ADD TEACHER MODAL (WITH DIRECT CLASS & SUBJECT ASSIGNMENT) */}
      {showAddTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowAddTeacherModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Add Faculty & Immediate Assignment</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Create faculty account and link to class and subject</p>
              </div>
              <button onClick={() => setShowAddTeacherModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddTeacher}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="form-control" placeholder="Prof. Jane Doe" value={teacherFormData.name} onChange={e => setTeacherFormData({ ...teacherFormData, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Employee ID</label>
                  <input type="text" className="form-control" placeholder="GIT-FAC-105" value={teacherFormData.employeeId} onChange={e => setTeacherFormData({ ...teacherFormData, employeeId: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Login Username</label>
                  <input type="text" className="form-control" placeholder="janedoe" value={teacherFormData.username} onChange={e => setTeacherFormData({ ...teacherFormData, username: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Login Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" value={teacherFormData.password} onChange={e => setTeacherFormData({ ...teacherFormData, password: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Department</label>
                  <input type="text" className="form-control" value={teacherFormData.department} onChange={e => setTeacherFormData({ ...teacherFormData, department: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Designated Post</label>
                  <input type="text" className="form-control" placeholder="Assistant Professor" value={teacherFormData.post} onChange={e => setTeacherFormData({ ...teacherFormData, post: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Profile Photo URL (Avatar)</label>
                <input type="text" className="form-control" value={teacherFormData.profilePhoto} onChange={e => setTeacherFormData({ ...teacherFormData, profilePhoto: e.target.value })} />
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '8px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.88rem', marginBottom: '10px' }}>
                  Immediate Class & Subject Assignment
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.78rem' }}>Assigned Class</label>
                    <select className="form-control" value={teacherFormData.classId} onChange={e => setTeacherFormData({ ...teacherFormData, classId: e.target.value })}>
                      <option value="">-- Optional: Assign Later --</option>
                      {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.78rem' }}>Assigned Subject</label>
                    <select className="form-control" value={teacherFormData.subjectId} onChange={e => setTeacherFormData({ ...teacherFormData, subjectId: e.target.value })}>
                      <option value="">-- Optional: Assign Later --</option>
                      {subjects.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create & Assign Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TIMETABLE SLOT MODAL */}
      {showAddTimetableModal && (
        <div className="modal-overlay" onClick={() => setShowAddTimetableModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Add Timetable Lecture Slot</h3>
              <button onClick={() => setShowAddTimetableModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddTimetableSlot}>
              <div className="input-group">
                <label className="input-label">Class</label>
                <select className="form-control" value={timetableForm.classId} onChange={e => setTimetableForm({ ...timetableForm, classId: e.target.value })} required>
                  {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Subject</label>
                <select className="form-control" value={timetableForm.subjectId} onChange={e => setTimetableForm({ ...timetableForm, subjectId: e.target.value })} required>
                  {subjects.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Faculty Instructor</label>
                <select className="form-control" value={timetableForm.teacherId} onChange={e => setTimetableForm({ ...timetableForm, teacherId: e.target.value })} required>
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (<option key={t.id} value={t.id}>{t.name} ({t.department})</option>))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Day of Week</label>
                  <select className="form-control" value={timetableForm.day} onChange={e => setTimetableForm({ ...timetableForm, day: e.target.value })}>
                    {daysOfWeek.map(d => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Period (1 to 7)</label>
                  <select className="form-control" value={timetableForm.period} onChange={e => setTimetableForm({ ...timetableForm, period: parseInt(e.target.value, 10) })}>
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (<option key={p} value={p}>Period {p}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Start Time</label>
                  <input type="text" className="form-control" placeholder="09:00 AM" value={timetableForm.startTime} onChange={e => setTimetableForm({ ...timetableForm, startTime: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">End Time</label>
                  <input type="text" className="form-control" placeholder="09:50 AM" value={timetableForm.endTime} onChange={e => setTimetableForm({ ...timetableForm, endTime: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Room No.</label>
                  <input type="text" className="form-control" placeholder="LH-301" value={timetableForm.roomNo} onChange={e => setTimetableForm({ ...timetableForm, roomNo: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddTimetableModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Lecture</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / PUBLISH SEMESTER RESULT MODAL */}
      {showAddResultModal && (
        <div className="modal-overlay" onClick={() => setShowAddResultModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Record & Publish Semester Result</h3>
              <button onClick={() => setShowAddResultModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddResult}>
              <div className="input-group">
                <label className="input-label">Select Student</label>
                <select className="form-control" value={resultForm.studentId} onChange={e => setResultForm({ ...resultForm, studentId: e.target.value })} required>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Roll #{s.roll_no} • {s.class_name})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <select className="form-control" value={resultForm.semester} onChange={e => setResultForm({ ...resultForm, semester: parseInt(e.target.value, 10) })}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (<option key={s} value={s}>Semester {s}</option>))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <select className="form-control" value={resultForm.subjectId} onChange={e => setResultForm({ ...resultForm, subjectId: e.target.value })} required>
                    {subjects.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Internal (Max 30)</label>
                  <input type="number" max="30" min="0" className="form-control" value={resultForm.internalMarks} onChange={e => setResultForm({ ...resultForm, internalMarks: parseFloat(e.target.value) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">External (Max 70)</label>
                  <input type="number" max="70" min="0" className="form-control" value={resultForm.externalMarks} onChange={e => setResultForm({ ...resultForm, externalMarks: parseFloat(e.target.value) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Course Credits</label>
                  <input type="number" min="1" max="6" className="form-control" value={resultForm.credits} onChange={e => setResultForm({ ...resultForm, credits: parseInt(e.target.value, 10) })} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddResultModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Grade Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BOOK MODAL */}
      {showAddBookModal && (
        <div className="modal-overlay" onClick={() => setShowAddBookModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Add Book to Central Library</h3>
              <button onClick={() => setShowAddBookModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddBook}>
              <div className="input-group">
                <label className="input-label">Book Title</label>
                <input type="text" className="form-control" placeholder="e.g. Clean Code" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Author</label>
                  <input type="text" className="form-control" placeholder="e.g. Robert C. Martin" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input type="text" className="form-control" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Total Copies</label>
                  <input type="number" min="1" className="form-control" value={bookForm.totalCopies} onChange={e => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value, 10) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Shelf Location</label>
                  <input type="text" className="form-control" placeholder="e.g. Rack CS-04" value={bookForm.shelfLocation} onChange={e => setBookForm({ ...bookForm, shelfLocation: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Create User Account</h3>
              <button onClick={() => setShowCreateUserModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="form-control" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Username / Login ID</label>
                  <input type="text" className="form-control" value={userFormData.username} onChange={e => setUserFormData({ ...userFormData, username: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input type="password" className="form-control" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Assign Role</label>
                  <select className="form-control" value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}>
                    <option value="Teacher">Teacher</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Student">Student</option>
                    <option value="Parent">Parent</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Designated Post / Title</label>
                  <input type="text" className="form-control" value={userFormData.post} onChange={e => setUserFormData({ ...userFormData, post: e.target.value })} placeholder="e.g. Professor, Cashier" required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {showEditRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditRoleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Modify Role & Post</h3>
              <button onClick={() => setShowEditRoleModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleUpdateRole}>
              <div className="input-group">
                <label className="input-label">New Role</label>
                <select className="form-control" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="Teacher">Teacher</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">New Post / Title</label>
                <input type="text" className="form-control" value={editPost} onChange={e => setEditPost(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditRoleModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Save Role Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {showCreateClassModal && (
        <div className="modal-overlay" onClick={() => setShowCreateClassModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Create College Class</h3>
              <button onClick={() => setShowCreateClassModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateClass}>
              <div className="input-group">
                <label className="input-label">Class Name</label>
                <input type="text" className="form-control" placeholder="e.g. B.Tech CSE - III Year - Section A" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Department</label>
                <input type="text" className="form-control" value={classForm.department} onChange={e => setClassForm({ ...classForm, department: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Year</label>
                  <input type="number" className="form-control" value={classForm.year} onChange={e => setClassForm({ ...classForm, year: parseInt(e.target.value, 10) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Section</label>
                  <input type="text" className="form-control" value={classForm.section} onChange={e => setClassForm({ ...classForm, section: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <input type="number" className="form-control" value={classForm.semester} onChange={e => setClassForm({ ...classForm, semester: parseInt(e.target.value, 10) })} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreateClassModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {showCreateSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowCreateSubjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Create Subject</h3>
              <button onClick={() => setShowCreateSubjectModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateSubject}>
              <div className="input-group">
                <label className="input-label">Subject Code</label>
                <input type="text" className="form-control" placeholder="e.g. CS305" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Subject Name</label>
                <input type="text" className="form-control" placeholder="e.g. Artificial Intelligence" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Department</label>
                <input type="text" className="form-control" value={subjectForm.department} onChange={e => setSubjectForm({ ...subjectForm, department: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreateSubjectModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN FACULTY MODAL */}
      {showAssignTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowAssignTeacherModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Assign Faculty to Class & Subject</h3>
              <button onClick={() => setShowAssignTeacherModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAssignTeacher}>
              <div className="input-group">
                <label className="input-label">Select Faculty / Teacher</label>
                <select className="form-control" value={assignForm.teacherId} onChange={e => setAssignForm({ ...assignForm, teacherId: e.target.value })} required>
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.post})</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Select Class</label>
                <select className="form-control" value={assignForm.classId} onChange={e => setAssignForm({ ...assignForm, classId: e.target.value })} required>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Select Subject</label>
                <select className="form-control" value={assignForm.subjectId} onChange={e => setAssignForm({ ...assignForm, subjectId: e.target.value })} required>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAssignTeacherModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {showEditTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowEditTeacherModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Edit Faculty Profile & Credentials</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Update faculty details, login User ID, and security password
                </p>
              </div>
              <button onClick={() => setShowEditTeacherModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEditTeacherSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input type="text" className="form-control" value={editTeacherFormData.name} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Employee ID *</label>
                  <input type="text" className="form-control" value={editTeacherFormData.employeeId} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, employeeId: e.target.value })} required />
                </div>
              </div>

              {/* CREDENTIALS SECTION */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} />
                  <span>Faculty Login Credentials</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Teacher User ID (Login) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editTeacherFormData.username}
                      onChange={e => setEditTeacherFormData({ ...editTeacherFormData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Change Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showEditTeacherPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Leave empty to keep unchanged"
                        value={editTeacherFormData.password}
                        onChange={e => setEditTeacherFormData({ ...editTeacherFormData, password: e.target.value })}
                        style={{ paddingRight: '38px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditTeacherPass(!showEditTeacherPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        {showEditTeacherPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Department *</label>
                  <input type="text" className="form-control" value={editTeacherFormData.department} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, department: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Designated Post *</label>
                  <input type="text" className="form-control" value={editTeacherFormData.post} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, post: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="form-control" value={editTeacherFormData.email} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input type="tel" className="form-control" value={editTeacherFormData.phone} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, phone: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Profile Photo URL</label>
                <input type="url" className="form-control" value={editTeacherFormData.profilePhoto} onChange={e => setEditTeacherFormData({ ...editTeacherFormData, profilePhoto: e.target.value })} />
              </div>

              {/* CURRENT TEACHING ASSIGNMENTS */}
              {editTeacherFormData.assignments && editTeacherFormData.assignments.length > 0 && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '8px' }}>
                    Currently Assigned Classes & Subjects:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {editTeacherFormData.assignments.map(a => (
                      <span key={a.assignment_id || Math.random()} style={{
                        fontSize: '0.75rem',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: '#93c5fd'
                      }}>
                        <strong>{a.class_name}</strong>: {a.subject_name} ({a.subject_code})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditTeacherModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TEACHER CONFIRMATION MODAL */}
      {showDeleteTeacherModal && teacherToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteTeacherModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '10px', borderRadius: '12px' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Confirm Faculty Removal</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permanent deletion of teacher record</p>
              </div>
            </div>

            {/* Target Teacher Identity Card */}
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
                  src={teacherToDelete.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacherToDelete.username}`}
                  alt={teacherToDelete.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{teacherToDelete.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {teacherToDelete.department} • {teacherToDelete.post}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)', marginTop: '4px' }}>
                  User ID: <code>{teacherToDelete.username}</code> • Emp ID: {teacherToDelete.employee_id || `FAC-${teacherToDelete.id}`}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              Are you sure you want to permanently remove Prof. <strong>{teacherToDelete.name}</strong> from the faculty directory? All teaching assignments, faculty attendance logs, and scheduled timetable periods for this teacher will be safely cleaned up without affecting any student classes, subjects, or other faculty members.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowDeleteTeacherModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDeleteTeacher} className="btn btn-danger">
                Permanently Remove Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
