import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, AlertTriangle } from 'lucide-react';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim()) errors.email = 'Email address is required.';
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');

    setLoading(true);
    try {
      await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo-badge">
            <UserPlus size={28} />
          </div>
          <h1 className="auth-title">Create FixIt Account</h1>
          <p className="auth-subtitle">Join the campus maintenance & issue tracking portal</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">
              <span>Full Name<span className="req">*</span></span>
            </label>
            <input
              type="text"
              name="name"
              className={`form-control ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. Alice Student"
              value={formData.name}
              onChange={handleChange}
            />
            {formErrors.name && (
              <div className="form-hint-error">
                <AlertTriangle size={12} /> {formErrors.name}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">
              <span>Email Address<span className="req">*</span></span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              placeholder="alice@college.edu"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <div className="form-hint-error">
                <AlertTriangle size={12} /> {formErrors.email}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">
              <span>Password (min 6 characters)<span className="req">*</span></span>
            </label>
            <input
              type="password"
              name="password"
              className={`form-control ${formErrors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <div className="form-hint-error">
                <AlertTriangle size={12} /> {formErrors.password}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Account Role</span>
              </label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Student / Resident</option>
                <option value="staff">Maintenance Staff</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Phone Contact</span>
              </label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label">
              <span>Department / Hostel / Branch</span>
            </label>
            <input
              type="text"
              name="department"
              className="form-control"
              placeholder="e.g. Computer Science / Block B Hostel"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.86rem', color: '#64748b' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
