import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper to safely parse responses without throwing "Unexpected end of JSON input"
async function parseJsonResponse(response) {
  const text = await response.text();
  let data = null;
  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  return { ok: response.ok, status: response.status, data, rawText: text };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sms_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const { ok, data } = await parseJsonResponse(res);
        if (ok && data && data.user) {
          setUser(data.user);
          localStorage.setItem('sms_user', JSON.stringify(data.user));
        } else if (!ok) {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [token]);

  /**
   * STRICT LOGIN FUNCTION:
   * Accepts ONLY username and password.
   * Does NOT accept or send any role parameter.
   * Backend verifies credentials and automatically identifies the user's role.
   */
  const login = async (username, password) => {
    let response;
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });
    } catch (networkErr) {
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          throw new Error('Connection to login service timed out. Please try again.');
        }
      } catch (hErr) {}
      throw new Error('Backend server is not responding (port 5000). Please ensure the backend server is active.');
    }

    const { ok, status, data, rawText } = await parseJsonResponse(response);

    if (!ok) {
      if (data && data.error) {
        throw new Error(data.error);
      }
      if (status === 504 || status === 502 || !rawText || rawText.trim().length === 0) {
        try {
          const hCheck = await fetch('/api/health');
          if (hCheck.ok) {
            throw new Error('Authentication request timed out. Please try again.');
          }
        } catch (e) {}
        throw new Error('Backend server is not responding (port 5000). Please ensure the backend server is active.');
      }
      throw new Error(`Login request failed with HTTP ${status}: ${response.statusText || 'Server Error'}`);
    }

    if (!data || !data.token || !data.user) {
      throw new Error('Invalid response received from server. Missing user credentials payload.');
    }

    // Store verified session and backend-detected role
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('sms_token', data.token);
    localStorage.setItem('sms_user', JSON.stringify(data.user));

    return data.user;
  };

  /**
   * First-Time Administrator Initialization
   */
  const setupAdmin = async (setupData) => {
    let response;
    try {
      response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(setupData)
      });
    } catch (networkErr) {
      throw new Error('Backend server is not responding (port 5000). Please ensure the backend server is active.');
    }

    const { ok, data } = await parseJsonResponse(response);
    if (!ok) {
      throw new Error((data && data.error) || 'Failed to initialize administrator.');
    }

    if (!data || !data.token || !data.user) {
      throw new Error('Missing user credentials payload.');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('sms_token', data.token);
    localStorage.setItem('sms_user', JSON.stringify(data.user));

    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
  };

  /**
   * Directly update the user state in context.
   */
  const updateUser = (partialUser) => {
    setUser(prev => {
      const updated = { ...prev, ...partialUser };
      localStorage.setItem('sms_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { ok, data } = await parseJsonResponse(res);
      if (ok && data && data.user) {
        setUser(data.user);
        localStorage.setItem('sms_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, setupAdmin, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
