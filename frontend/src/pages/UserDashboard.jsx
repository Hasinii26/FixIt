import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  PlusCircle, 
  Eye, 
  MapPin, 
  Tag,
  XCircle,
  Inbox,
  AlertTriangle
} from 'lucide-react';

const UserDashboard = ({ activeTab, setActiveTab }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Submit form state
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Electrical',
    location: '',
    priority: 'Medium',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/complaints/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const validateForm = () => {
    const errors = {};
    if (!newComplaint.title.trim()) {
      errors.title = 'Title is required.';
    } else if (newComplaint.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters.';
    }

    if (!newComplaint.location.trim()) {
      errors.location = 'Specific location/room is required.';
    }

    if (!newComplaint.description.trim()) {
      errors.description = 'Description is required.';
    } else if (newComplaint.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewComplaint({ ...newComplaint, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const setPriorityLevel = (priority) => {
    setNewComplaint({ ...newComplaint, priority });
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitSuccess('');
    setSubmitError('');

    try {
      const res = await api.post('/complaints', newComplaint);
      if (res.data.success) {
        setSubmitSuccess(`Complaint submitted successfully! Reference ID: ${res.data.complaint.complaint_code}`);
        setNewComplaint({
          title: '',
          description: '',
          category: 'Electrical',
          location: '',
          priority: 'Medium',
        });
        setFormErrors({});
        fetchStats();
        fetchComplaints();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit complaint. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFiltered = Boolean(search || categoryFilter || statusFilter);

  return (
    <div>
      {/* Metric Cards with Contextual Details */}
      <div className="stat-grid">
        <StatCard
          title="Total Submitted"
          value={stats.total}
          description="Lifetime maintenance requests"
          icon={<FileText size={22} />}
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          description="Awaiting assignment"
          icon={<Clock size={22} />}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          description="Assigned technician actively working"
          icon={<AlertCircle size={22} />}
          color="#ea580c"
          bg="#ffedd5"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          description="Closed & verified fixes"
          icon={<CheckCircle size={22} />}
          color="#16a34a"
          bg="#dcfce7"
        />
      </div>

      {/* Submit New Complaint View (Active when on new-complaint tab) */}
      {activeTab === 'new-complaint' && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <PlusCircle size={20} color="#0d9488" />
                Lodge a Maintenance Request
              </h2>
              <p className="section-subtitle">
                Submit campus defect reports to the facilities dispatch desk
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('dashboard')}
            >
              ← Back to My Complaints
            </button>
          </div>

          <div style={{ padding: '28px' }}>
            {submitSuccess && (
              <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} />
                  <span>{submitSuccess}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('dashboard')}
                >
                  View in My Complaints
                </button>
              </div>
            )}
            {submitError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitComplaint} noValidate>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    <span>Complaint Title / Issue Summary<span className="req">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${formErrors.title ? 'error' : ''}`}
                    placeholder="e.g. Broken bench and flickering socket in Classroom 402"
                    value={newComplaint.title}
                    onChange={handleFormChange}
                  />
                  {formErrors.title && (
                    <div className="form-hint-error">
                      <AlertTriangle size={12} /> {formErrors.title}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Category<span className="req">*</span></span>
                  </label>
                  <select
                    name="category"
                    className="form-control"
                    value={newComplaint.category}
                    onChange={handleFormChange}
                  >
                    <option value="Electrical">⚡ Electrical Maintenance</option>
                    <option value="Plumbing">🔧 Plumbing & Water</option>
                    <option value="Internet">🌐 Internet & WiFi</option>
                    <option value="Cleaning">🧹 Cleaning & Sanitation</option>
                    <option value="Other">📦 Other Infrastructure</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Specific Location / Room Number<span className="req">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    className={`form-control ${formErrors.location ? 'error' : ''}`}
                    placeholder="e.g. Science Block 3rd Floor, Lab 5"
                    value={newComplaint.location}
                    onChange={handleFormChange}
                  />
                  {formErrors.location && (
                    <div className="form-hint-error">
                      <AlertTriangle size={12} /> {formErrors.location}
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span>Priority Level</span>
                  </label>
                  <div className="priority-selector-row">
                    <button
                      type="button"
                      className={`priority-choice-btn ${newComplaint.priority === 'Low' ? 'selected-low' : ''}`}
                      onClick={() => setPriorityLevel('Low')}
                    >
                      🟢 Low (Routine inconvenience)
                    </button>
                    <button
                      type="button"
                      className={`priority-choice-btn ${newComplaint.priority === 'Medium' ? 'selected-med' : ''}`}
                      onClick={() => setPriorityLevel('Medium')}
                    >
                      🟡 Medium (Affects regular work)
                    </button>
                    <button
                      type="button"
                      className={`priority-choice-btn ${newComplaint.priority === 'High' ? 'selected-high' : ''}`}
                      onClick={() => setPriorityLevel('High')}
                    >
                      🔴 High (Urgent / Hazard)
                    </button>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span>Detailed Problem Description<span className="req">*</span></span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {newComplaint.description.length} / 500 characters
                    </span>
                  </label>
                  <textarea
                    name="description"
                    className={`form-control ${formErrors.description ? 'error' : ''}`}
                    placeholder="Describe specific symptoms, exact equipment tag, when the issue began, or safety implications..."
                    value={newComplaint.description}
                    onChange={handleFormChange}
                    maxLength={500}
                    rows="4"
                  />
                  {formErrors.description && (
                    <div className="form-hint-error">
                      <AlertTriangle size={12} /> {formErrors.description}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting to Database...' : 'Submit Maintenance Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaints List Table (Active on dashboard tab) */}
      {activeTab === 'dashboard' && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <FileText size={20} color="#0d9488" />
                My Registered Complaints
              </h2>
              <p className="section-subtitle">
                Track status updates and technician logs in real time
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('new-complaint')}
              >
                <PlusCircle size={15} /> + Lodge New Ticket
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            <form onSubmit={handleSearchSubmit} className="search-input-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search by ticket code, room, or issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Internet">Internet / WiFi</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {isFiltered && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={clearFilters}
              >
                <XCircle size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="table-responsive">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading complaint records...</div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-wrap">
                  <Inbox size={30} />
                </div>
                <h3 className="empty-state-title">
                  {isFiltered ? 'No matching tickets found' : 'No complaints filed yet'}
                </h3>
                <p className="empty-state-text">
                  {isFiltered 
                    ? 'Try adjusting your search criteria or clearing filters.' 
                    : 'Whenever you encounter facility defects or maintenance needs across campus, file a request here.'}
                </p>
                {isFiltered ? (
                  <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                    Clear Active Filters
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setActiveTab('new-complaint')}
                  >
                    <PlusCircle size={15} /> Lodge Your First Complaint
                  </button>
                )}
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Issue Title</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Specialist</th>
                    <th>Submitted On</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="ticket-id-tag">{item.complaint_code}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Tag size={11} /> {item.category}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem' }}>
                          <MapPin size={13} color="#64748b" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td>
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        {item.staff_name ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d9488' }}>
                              {item.staff_name}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Assigned</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedComplaintId(item.id)}
                        >
                          <Eye size={14} /> View Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal View */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onRefresh={() => {
            fetchStats();
            fetchComplaints();
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
