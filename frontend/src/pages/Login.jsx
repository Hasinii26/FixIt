import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Key, Mail, AlertCircle } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Wrench size={28} />
          </div>
          <h1 className="auth-title">FixIt Portal</h1>
          <p className="auth-subtitle">Enterprise Campus Maintenance Management</p>
        </div>

        {/* Demo Accounts Bar */}
        <div className="quick-demo-section">
          <div className="quick-demo-title">College Demo Quick-Fill Accounts</div>
          <div className="quick-demo-btn-group">
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => fillDemo('student@fixit.com')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => fillDemo('staff.electric@fixit.com')}
            >
              ⚡ Staff
            </button>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => fillDemo('admin@fixit.com')}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              <span>Email Address</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label">
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Key
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '18px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating Session...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.86rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
