import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  MapPin, 
  Tag,
  XCircle,
  Inbox,
  User
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, assigned: 0, in_progress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      console.error('Failed to load assigned complaints:', err);
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

  const isFiltered = Boolean(search || categoryFilter || statusFilter);

  return (
    <div>
      {/* Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Work Orders"
          value={stats.total}
          description="Lifetime jobs assigned to you"
          icon={<Wrench size={22} />}
          color="#0f172a"
          bg="#f1f5f9"
        />
        <StatCard
          title="New Assignments"
          value={stats.assigned}
          description="Pending technician pickup"
          icon={<AlertCircle size={22} />}
          color="#7e22ce"
          bg="#f3e8ff"
        />
        <StatCard
          title="Work In Progress"
          value={stats.in_progress}
          description="Jobs currently underway"
          icon={<Clock size={22} />}
          color="#b45309"
          bg="#fef3c7"
        />
        <StatCard
          title="Resolved by You"
          value={stats.resolved}
          description="Fixed and verified jobs"
          icon={<CheckCircle size={22} />}
          color="#15803d"
          bg="#dcfce7"
        />
      </div>

      {/* Assigned Tasks Card */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Wrench size={20} color="#0d9488" />
              Active Maintenance Work Orders
            </h2>
            <p className="section-subtitle">
              Technician: <strong>{user?.name}</strong> • {user?.department || 'Specialist'}
            </p>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing {complaints.length} tasks
          </span>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <form onSubmit={handleSearchSubmit} className="search-input-box">
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search work orders by code, room, or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned (Pending Start)</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

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
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Fetching assigned jobs from database...</div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Inbox size={30} />
              </div>
              <h3 className="empty-state-title">
                {isFiltered ? 'No matching work orders found' : 'No active work orders'}
              </h3>
              <p className="empty-state-text">
                {isFiltered 
                  ? 'Try clearing your filters to see all assigned jobs.' 
                  : 'You currently have zero pending maintenance complaints assigned to your queue.'}
              </p>
              {isFiltered && (
                <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                  Clear Active Filters
                </button>
              )}
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Code</th>
                  <th>Issue Details</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Student Contact</th>
                  <th>Admin Instructions</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="#64748b" />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{item.user_name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.user_department || 'Student'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '220px' }}>
                      {item.assignment_notes ? (
                        <span style={{ fontStyle: 'italic', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                          "{item.assignment_notes}"
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-navy btn-sm"
                        onClick={() => setSelectedComplaintId(item.id)}
                      >
                        <Wrench size={14} /> Update & Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details & Resolution Modal */}
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

export default StaffDashboard;
