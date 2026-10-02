import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, Key, Bell, Globe, Moon, Shield, Info, 
  LogOut, CheckCircle2, AlertCircle, Save, Eye, EyeOff, 
  Lock, Check, Smartphone, Mail, Sliders
} from 'lucide-react';

export default function SettingsPage() {
  const { token, user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('password'); // 'password', 'notifications', 'appearance', 'language', 'security', 'about'
  
  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    attendanceAlerts: true,
    feeReminders: true,
    resultNotifications: true,
    canteenUpdates: false
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Appearance & Language State
  const [theme, setTheme] = useState('glassmorphism');
  const [language, setLanguage] = useState('en');
  const [twoFactor, setTwoFactor] = useState(false);

  // Fetch initial settings from server
  useEffect(() => {
    async function loadSettings() {
      if (!token) return;
      try {
        const res = await fetch('/api/users/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setNotifications({
              emailAlerts: Boolean(data.settings.email_alerts),
              smsAlerts: Boolean(data.settings.sms_alerts),
              attendanceAlerts: Boolean(data.settings.attendance_alerts),
              feeReminders: Boolean(data.settings.fee_reminders),
              resultNotifications: Boolean(data.settings.result_notifications),
              canteenUpdates: Boolean(data.settings.canteen_updates)
            });
            if (data.settings.theme) setTheme(data.settings.theme);
            if (data.settings.language) setLanguage(data.settings.language);
            setTwoFactor(Boolean(data.settings.two_factor_enabled));
          }
        }
      } catch (err) {
        // use fallback defaults
      }
    }
    loadSettings();
  }, [token]);

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('New passwords do not match. Please verify.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setPwLoading(true);
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPwSuccess(data.message || 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = async () => {
    setSettingsLoading(true);
    setSettingsSuccess('');
    try {
      const res = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailAlerts: notifications.emailAlerts,
          smsAlerts: notifications.smsAlerts,
          attendanceAlerts: notifications.attendanceAlerts,
          feeReminders: notifications.feeReminders,
          resultNotifications: notifications.resultNotifications,
          canteenUpdates: notifications.canteenUpdates,
          theme,
          language,
          twoFactorEnabled: twoFactor
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettingsSuccess('Preferences saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 3500);
    } catch (err) {
      alert('Error saving preferences: ' + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const menuSections = [
    { id: 'password', label: 'Change Password', icon: Key },
    { id: 'notifications', label: 'Notification Alerts', icon: Bell },
    { id: 'appearance', label: 'Theme & Appearance', icon: Moon },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'about', label: 'App Information', icon: Info }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          System Settings & Preferences
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Manage your account credentials, alert preferences, interface themes, and security settings.
        </p>
      </div>

      {settingsSuccess && (
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
          <span>{settingsSuccess}</span>
        </div>
      )}

      {/* 2-Column Settings Layout: Nav Menu + Content Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Settings Navigation Menu */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuSections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} />
                  <span>{sec.label}</span>
                </button>
              );
            })}

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 0' }} />

            <button
              type="button"
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'left'
              }}
            >
              <LogOut size={18} />
              <span>Sign Out Account</span>
            </button>
          </div>
        </div>

        {/* Right Settings Content Slot */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          {/* ==================================================== */}
          {/* 1. CHANGE PASSWORD SECTION */}
          {/* ==================================================== */}
          {activeSection === 'password' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={20} color="var(--primary-light)" />
                  Change Account Password
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Ensure your account is protected with a strong, distinct password.
                </p>
              </div>

              {pwSuccess && (
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
                  <span>{pwSuccess}</span>
                </div>
              )}

              {pwError && (
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
                  <span>{pwError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '480px' }}>
                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer'
                      }}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer'
                      }}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '12px 24px', marginTop: '12px' }}
                >
                  <Lock size={16} />
                  <span>{pwLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. NOTIFICATIONS PREFERENCES */}
          {/* ==================================================== */}
          {activeSection === 'notifications' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={20} color="var(--primary-light)" />
                  Notification & Alert Preferences
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Configure which communication channels and events notify you.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    id: 'emailAlerts',
                    title: 'Email Notifications',
                    desc: 'Receive official announcements and academic alerts via email.',
                    icon: Mail
                  },
                  {
                    id: 'smsAlerts',
                    title: 'SMS Absence Alerts',
                    desc: 'Direct SMS to registered emergency phone number if absent.',
                    icon: Smartphone
                  },
                  {
                    id: 'attendanceAlerts',
                    title: 'Real-Time Period Attendance Alerts',
                    desc: 'Instant push alerts when attendance is logged for each lecture.',
                    icon: CheckCircle2
                  },
                  {
                    id: 'feeReminders',
                    title: 'Tuition Fee Reminders & Payment Receipts',
                    desc: 'Notifies when dues are pending or payments are acknowledged.',
                    icon: Bell
                  },
                  {
                    id: 'resultNotifications',
                    title: 'Semester Results & Marks Release',
                    desc: 'Alerts when official grade cards and examination marks are published.',
                    icon: Award
                  },
                  {
                    id: 'canteenUpdates',
                    title: 'Canteen Order Status Updates',
                    desc: 'Notifies when canteen food orders are ready for pickup.',
                    icon: Sliders
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{item.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                      <input
                        type="checkbox"
                        checked={notifications[item.id]}
                        onChange={e => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: notifications[item.id] ? '#4f46e5' : 'rgba(255, 255, 255, 0.15)',
                        transition: '0.3s',
                        borderRadius: '26px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: notifications[item.id] ? '24px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.3s',
                          borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={settingsLoading}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '12px 24px', width: 'fit-content', marginTop: '10px' }}
                >
                  <Save size={16} />
                  <span>{settingsLoading ? 'Saving...' : 'Save Notification Preferences'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 3. THEME & APPEARANCE */}
          {/* ==================================================== */}
          {activeSection === 'appearance' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Moon size={20} color="var(--primary-light)" />
                  Appearance & Design System
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Customize the interface theme of your smart dashboard.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  { id: 'glassmorphism', name: 'Dark Glassmorphism', desc: 'Vibrant indigo glow & frosted glass (Default)', color: '#4f46e5' },
                  { id: 'midnight', name: 'Midnight Navy', desc: 'Deep oceanic blue with cyan highlights', color: '#0ea5e9' },
                  { id: 'slate', name: 'Slate Modern', desc: 'Minimalist neutral dark slate with emerald accents', color: '#10b981' },
                  { id: 'light', name: 'Clean Light Slate', desc: 'High-contrast clean daylight interface', color: '#f59e0b' }
                ].map(t => (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: theme === t.id ? `2px solid ${t.color}` : '1px solid var(--border-subtle)',
                      background: theme === t.id ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: t.color, marginBottom: '12px' }} />
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>{t.desc}</div>
                    {theme === t.id && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', color: t.color }}>
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={settingsLoading}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '12px 24px' }}
              >
                <Save size={16} />
                <span>{settingsLoading ? 'Applying...' : 'Apply Appearance Theme'}</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 4. LANGUAGE & REGIONAL */}
          {/* ==================================================== */}
          {activeSection === 'language' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={20} color="var(--primary-light)" />
                  Language & Regional Settings
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Select your primary dialect and time formatting.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                  { code: 'en', label: 'English (US / India)', native: 'English' },
                  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
                  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
                  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
                  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' }
                ].map(lang => (
                  <div
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: language === lang.code ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: language === lang.code ? 'rgba(79, 70, 229, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#fff' }}>{lang.native}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{lang.label}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={settingsLoading}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '12px 24px' }}
              >
                <Save size={16} />
                <span>Save Regional Preference</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 5. SECURITY & PRIVACY */}
          {/* ==================================================== */}
          {activeSection === 'security' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="#fbbf24" />
                  Security & Privacy Policy
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Protect your login session and review private data guarantees.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  padding: '18px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>Two-Factor Authentication (2FA)</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                      Require SMS verification code on login.
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={e => setTwoFactor(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: twoFactor ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                      transition: '0.3s', borderRadius: '26px'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '20px', width: '20px',
                        left: twoFactor ? '24px' : '3px', bottom: '3px',
                        backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)'
                }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#60a5fa', marginBottom: '8px' }}>
                    Strict Role-Based Privacy Guarantee
                  </h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
                    In accordance with college data governance standards, user access tokens (JWT) enforce exact role-level boundaries. Students and parents can never view private records of unrelated students or faculty members. All sensitive student data is encrypted and isolated.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={settingsLoading}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '12px 24px' }}
              >
                <Save size={16} />
                <span>Save Security Settings</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 6. APP INFORMATION */}
          {/* ==================================================== */}
          {activeSection === 'about' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={20} color="var(--primary-light)" />
                  Application Information
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  EduSphere – Smart Campus Management System
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>VERSION</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>v2.4.0 (Enterprise)</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DATABASE ENGINE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>SQLite WAL Mode</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>BUILD ID</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '4px' }}>GIT-SMS-2026-REL</div>
                </div>
              </div>

              <div style={{ padding: '18px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>License & Rights</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  © 2026 EduSphere. All rights reserved. Powered by React, Vite, Express, and JWT Authentication.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
