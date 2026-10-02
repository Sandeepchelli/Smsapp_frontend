import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellRing, Plus, Edit3, Trash2, Send, Eye, CheckCheck,
  AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Users,
  Calendar, Flag, Paperclip, Search, Filter, RefreshCw, X, Check, Megaphone
} from 'lucide-react';

const PRIORITY_CONFIG = {
  Low:    { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', icon: Info },
  Normal: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: Bell },
  High:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle },
  Urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle }
};

const AUDIENCE_OPTIONS = [
  'All', 'Teacher', 'Student', 'Parent', 'Cashier',
  'Library Staff', 'Driver', 'Watchman', 'Attender',
  'Lab Technician', 'Canteen Staff', 'College Management Staff', 'Specific'
];

// ─── ADMIN NOTICE MANAGEMENT ──────────────────────────────────────────────────
export function AdminNoticesModule({ token }) {
  const [notices, setNotices] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Normal',
    targetAudience: 'All',
    targetUserIds: [],
    attachmentUrl: '',
    noticeDate: new Date().toISOString().split('T')[0]
  });

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notices/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/notices/users-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    fetchNotices();
    fetchUsers();
  }, [fetchNotices, fetchUsers]);

  const resetForm = () => {
    setForm({
      title: '', description: '', priority: 'Normal',
      targetAudience: 'All', targetUserIds: [],
      attachmentUrl: '', noticeDate: new Date().toISOString().split('T')[0]
    });
    setEditingNotice(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setStatusMsg('❌ Title and description are required.');
      return;
    }
    try {
      const url = editingNotice ? `/api/notices/${editingNotice.id}` : '/api/notices';
      const method = editingNotice ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`✅ Notice ${editingNotice ? 'updated' : 'published'} successfully!`);
        resetForm();
        fetchNotices();
      } else {
        setStatusMsg(`❌ ${data.error}`);
      }
    } catch (e) {
      setStatusMsg('❌ Network error.');
    }
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleEdit = (notice) => {
    setForm({
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
      targetAudience: notice.target_audience,
      targetUserIds: notice.target_user_ids ? JSON.parse(notice.target_user_ids) : [],
      attachmentUrl: notice.attachment_url || '',
      noticeDate: notice.notice_date
    });
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDelete = async (noticeId, title) => {
    if (!window.confirm(`Delete notice "${title}"?`)) return;
    try {
      const res = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg('✅ Notice deleted.');
        fetchNotices();
      }
    } catch (e) {}
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const toggleSpecificUser = (userId) => {
    setForm(prev => ({
      ...prev,
      targetUserIds: prev.targetUserIds.includes(userId)
        ? prev.targetUserIds.filter(id => id !== userId)
        : [...prev.targetUserIds, userId]
    }));
  };

  const filtered = notices.filter(n =>
    !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const priorityColors = {
    Low: '#22d3ee', Normal: '#818cf8', High: '#f59e0b', Urgent: '#ef4444'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone size={22} color="#818cf8" />
            Notices &amp; Announcements
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Create and manage institution-wide announcements. {notices.length} notice{notices.length !== 1 ? 's' : ''} total.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Notice'}
        </button>
      </div>

      {statusMsg && (
        <div style={{
          background: statusMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${statusMsg.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
          color: statusMsg.startsWith('✅') ? '#4ade80' : '#f87171', fontSize: '0.88rem'
        }}>
          {statusMsg}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(129,140,248,0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: '#818cf8' }}>
            {editingNotice ? 'Edit Notice' : 'Create New Notice'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="input-label">Notice Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Holiday Announcement" required />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="input-label">Description / Message *</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Write the full announcement message here..."
                  required
                />
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select className="form-control" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="input-label">Notice Date</label>
                <input type="date" className="form-control" value={form.noticeDate} onChange={e => setForm(p => ({ ...p, noticeDate: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Target Audience</label>
                <select className="form-control" value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value, targetUserIds: [] }))}>
                  {AUDIENCE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Attachment URL (optional)</label>
                <input className="form-control" value={form.attachmentUrl} onChange={e => setForm(p => ({ ...p, attachmentUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>

            {/* Specific Users Selection */}
            {form.targetAudience === 'Specific' && (
              <div style={{ marginBottom: '16px' }}>
                <label className="input-label">Select Specific Users</label>
                <div style={{
                  maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px'
                }}>
                  {usersList.map(u => (
                    <button
                      key={u.id} type="button"
                      onClick={() => toggleSpecificUser(u.id)}
                      style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer',
                        border: `1px solid ${form.targetUserIds.includes(u.id) ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                        background: form.targetUserIds.includes(u.id) ? 'rgba(129,140,248,0.2)' : 'transparent',
                        color: form.targetUserIds.includes(u.id) ? '#818cf8' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      {form.targetUserIds.includes(u.id) && <Check size={11} />}
                      {u.name} <span style={{ opacity: 0.6 }}>({u.role})</span>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {form.targetUserIds.length} user{form.targetUserIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} />
                {editingNotice ? 'Update Notice' : 'Publish Notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          className="form-control"
          style={{ paddingLeft: '38px' }}
          placeholder="Search notices..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Notices List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading notices...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Megaphone size={36} style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
          No notices found. Create your first announcement.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(notice => {
            const PriorityIcon = PRIORITY_CONFIG[notice.priority]?.icon || Bell;
            const priorityColor = priorityColors[notice.priority] || '#818cf8';
            const isExpanded = expandedId === notice.id;
            return (
              <div key={notice.id} className="glass-panel" style={{
                borderRadius: '14px', overflow: 'hidden',
                borderLeft: `3px solid ${priorityColor}`
              }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <PriorityIcon size={16} color={priorityColor} />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{notice.title}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                          background: `rgba(${priorityColor === '#ef4444' ? '239,68,68' : priorityColor === '#f59e0b' ? '245,158,11' : '129,140,248'},0.15)`,
                          color: priorityColor
                        }}>{notice.priority}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem',
                          background: 'rgba(129,140,248,0.1)', color: '#818cf8'
                        }}>→ {notice.target_audience}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>📅 {notice.notice_date}</span>
                        <span>👁 {notice.read_count || 0} read</span>
                        <span>By: {notice.created_by_name}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => setExpandedId(isExpanded ? null : notice.id)}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleEdit(notice)}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(notice.id, notice.title)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {notice.description}
                      </p>
                      {notice.attachment_url && (
                        <a href={notice.attachment_url} target="_blank" rel="noreferrer"
                          style={{ color: '#818cf8', fontSize: '0.8rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Paperclip size={14} /> View Attachment
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── NOTICE VIEWER (for all roles) ─────────────────────────────────────────────
export function NoticesViewer({ token, compact = false }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const all = data.notices || [];
        setNotices(all);
        setUnreadCount(all.filter(n => !n.is_read).length);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const markRead = async (noticeId) => {
    try {
      await fetch(`/api/notices/${noticeId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notices/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleExpand = (noticeId, isRead) => {
    const newId = expandedId === noticeId ? null : noticeId;
    setExpandedId(newId);
    if (newId && !isRead) {
      markRead(noticeId);
    }
  };

  const priorityColors = {
    Low: '#22d3ee', Normal: '#818cf8', High: '#f59e0b', Urgent: '#ef4444'
  };

  const displayed = filter === 'unread' ? notices.filter(n => !n.is_read) : notices;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BellRing size={20} color="#818cf8" />
            Notices &amp; Announcements
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff', borderRadius: '20px',
                padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700
              }}>{unreadCount} New</span>
            )}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {notices.length} notice{notices.length !== 1 ? 's' : ''} for you
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px' }}>
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                  background: filter === f ? 'rgba(129,140,248,0.2)' : 'transparent',
                  color: filter === f ? '#818cf8' : 'var(--text-muted)'
                }}>
                {f === 'unread' ? `Unread (${unreadCount})` : 'All'}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}
              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button className="btn btn-secondary" onClick={fetchNotices} style={{ padding: '6px 10px' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading notices...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Bell size={36} style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }} />
          {filter === 'unread' ? 'No unread notices.' : 'No notices for you yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map(notice => {
            const priorityColor = priorityColors[notice.priority] || '#818cf8';
            const isExpanded = expandedId === notice.id;
            return (
              <div key={notice.id} className="glass-panel" style={{
                borderRadius: '12px', overflow: 'hidden',
                borderLeft: `3px solid ${notice.is_read ? 'rgba(255,255,255,0.1)' : priorityColor}`,
                opacity: notice.is_read ? 0.8 : 1
              }}>
                <div
                  style={{ padding: '14px 18px', cursor: 'pointer' }}
                  onClick={() => handleExpand(notice.id, notice.is_read)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        {!notice.is_read && (
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: priorityColor, display: 'inline-block', flexShrink: 0
                          }} />
                        )}
                        <span style={{ fontWeight: notice.is_read ? 600 : 800, fontSize: '0.92rem' }}>
                          {notice.title}
                        </span>
                        <span style={{
                          padding: '1px 7px', borderRadius: '20px', fontSize: '0.68rem',
                          background: `${priorityColor}20`, color: priorityColor, fontWeight: 600
                        }}>{notice.priority}</span>
                        {!notice.is_read && (
                          <span style={{
                            padding: '1px 7px', borderRadius: '20px', fontSize: '0.68rem',
                            background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 700
                          }}>NEW</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📅 {notice.notice_date} &nbsp;·&nbsp; From: {notice.created_by_name}
                        {notice.is_read && <span style={{ marginLeft: '8px', color: '#4ade80' }}>✓ Read</span>}
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}
                      onClick={e => e.stopPropagation()}>
                      <p style={{ fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                        {notice.description}
                      </p>
                      {notice.attachment_url && (
                        <a href={notice.attachment_url} target="_blank" rel="noreferrer"
                          style={{ color: '#818cf8', fontSize: '0.8rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Paperclip size={14} /> View Attachment
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default { AdminNoticesModule, NoticesViewer };
