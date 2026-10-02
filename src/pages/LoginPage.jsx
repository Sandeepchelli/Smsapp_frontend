import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, School, ArrowRight, AlertCircle, Sparkles, Phone, Mail, Building, UserPlus, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, setupAdmin } = useAuth();
  const [isSetup, setIsSetup] = useState(true);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial setup form state (only shown if DB has 0 users)
  const [setupForm, setSetupForm] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    post: 'Principal / Head Administrator',
    department: 'Administration'
  });

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch('/api/auth/setup-status');
        if (res.ok) {
          const data = await res.json();
          setIsSetup(data.isSetup);
        }
      } catch (err) {
        console.error('Setup status check error:', err);
      } finally {
        setCheckingSetup(false);
      }
    }
    checkSetup();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both Username/ID and Password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Invalid Username or Password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!setupForm.name.trim() || !setupForm.username.trim() || !setupForm.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (setupForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (setupForm.password !== setupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await setupAdmin({
        name: setupForm.name.trim(),
        username: setupForm.username.trim(),
        password: setupForm.password,
        email: setupForm.email.trim() || null,
        phone: setupForm.phone.trim() || null,
        post: setupForm.post.trim() || 'Principal / Head Administrator',
        department: setupForm.department.trim() || 'Administration'
      });
    } catch (err) {
      setError(err.message || 'Failed to initialize administrator account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background Decorative Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Authentication Card */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: isSetup ? '440px' : '520px',
        padding: '40px 36px',
        position: 'relative',
        zIndex: 1,
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        transition: 'all 0.3s ease'
      }}>
        {/* School Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.35)'
          }}>
            <School size={34} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }}>
            EduSphere
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSetup ? 'School Management System & Portal' : 'First-Time System Initialization'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* FIRST-TIME ADMIN SETUP FORM */}
        {!isSetup && !checkingSetup ? (
          <div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem', color: '#a7f3d0', lineHeight: 1.4 }}>
                <strong>Initial Setup:</strong> Create the root Principal / Administrator account to get started with your institution.
              </span>
            </div>

            <form onSubmit={handleSetupSubmit} id="adminSetupForm">
              <div className="input-group">
                <label className="input-label" htmlFor="setupName">Principal / Admin Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', display: 'flex' }}>
                    <User size={18} />
                  </span>
                  <input
                    id="setupName"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '42px' }}
                    placeholder="e.g. Dr. K. S. Sharma"
                    value={setupForm.name}
                    onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="setupUsername">Username / ID *</label>
                  <input
                    id="setupUsername"
                    type="text"
                    className="form-control"
                    placeholder="e.g. admin"
                    value={setupForm.username}
                    onChange={(e) => setSetupForm({ ...setupForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="setupPhone">Phone Number</label>
                  <input
                    id="setupPhone"
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={setupForm.phone}
                    onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="setupEmail">Email Address</label>
                <input
                  id="setupEmail"
                  type="email"
                  className="form-control"
                  placeholder="principal@institution.edu"
                  value={setupForm.email}
                  onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="setupPassword">Password *</label>
                  <input
                    id="setupPassword"
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={setupForm.password}
                    onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="setupConfirmPassword">Confirm Password *</label>
                  <input
                    id="setupConfirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Confirm password"
                    value={setupForm.confirmPassword}
                    onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="setupSubmitBtn"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px'
                }}
              >
                {isSubmitting ? (
                  <span>Creating Administrator Account...</span>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Create Administrator & Launch Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STANDARD LOGIN FORM */
          <div>
            {/* Automatic Role Detection Indicator Badge */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={18} color="var(--primary-light)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#c7d2fe', lineHeight: 1.4 }}>
                <strong>Automatic Role Detection:</strong> Sign in with your registered ID. The system authenticates against the database and directs you to your dashboard.
              </span>
            </div>

            <form onSubmit={handleLogin} id="loginForm">
              {/* Username / ID */}
              <div className="input-group">
                <label className="input-label" htmlFor="usernameInput">
                  Username / ID
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    display: 'flex'
                  }}>
                    <User size={18} />
                  </span>
                  <input
                    id="usernameInput"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '42px' }}
                    placeholder="Enter your Username or ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group" style={{ marginBottom: '26px' }}>
                <label className="input-label" htmlFor="passwordInput">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    display: 'flex'
                  }}>
                    <Lock size={18} />
                  </span>
                  <input
                    id="passwordInput"
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '42px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="loginSubmitBtn"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px'
                }}
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          Protected by EduSphere RBAC Security Engine
        </div>
      </div>
    </div>
  );
}
