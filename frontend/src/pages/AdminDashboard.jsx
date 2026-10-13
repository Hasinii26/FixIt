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
  Users, 
  ShieldCheck, 
  Eye, 
  UserCheck, 
  MapPin, 
  Tag,
  XCircle,
  Inbox,
  Phone,
  Mail,
  Briefcase
} from 'lucide-react';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [stats, setStats] = useState({ total: 0, submitted: 0, assigned: 0, in_progress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Quick assignment state
  const [assigningId, setAssigningId] = useState(null);
  const [assignStaffMap, setAssignStaffMap] = useState({});

  useEffect(() => {
    fetchStats();
    fetchComplaints();
    fetchStaff();
  }, [categoryFilter, statusFilter, priorityFilter]);

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
      if (priorityFilter) params.priority = priorityFilter;
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

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users/staff');
      if (res.data.success) {
        setStaffList(res.data.staff);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
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
    setPriorityFilter('');
  };

  const handleQuickAssign = async (complaintId) => {
    const staffId = assignStaffMap[complaintId];
    if (!staffId) return;

    try {
      setAssigningId(complaintId);
      const res = await api.put(`/complaints/${complaintId}/assign`, {
        staff_id: staffId,
        notes: 'Assigned via Admin quick-dispatch console',
      });
      if (res.data.success) {
        fetchStats();
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setAssigningId(null);
    }
  };

  const isFiltered = Boolean(search || categoryFilter || statusFilter || priorityFilter);

  return (
    <div>
      {/* Overview Stat Cards */}
      <div className="stat-grid">
        <StatCard
          title="All Complaints"
          value={stats.total}
          description="Campus-wide maintenance logs"
          icon={<FileText size={22} />}
          color="#0f172a"
          bg="#f1f5f9"
        />
        <StatCard
          title="New / Submitted"
          value={stats.submitted}
          description="Needs staff dispatch"
          icon={<AlertCircle size={22} />}
          color="#4338ca"
          bg="#e0e7ff"
        />
        <StatCard
          title="Assigned to Staff"
          value={stats.assigned}
          description="Awaiting technician start"
          icon={<UserCheck size={22} />}
          color="#7e22ce"
          bg="#f3e8ff"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          description="Active technician repairs"
          icon={<Clock size={22} />}
          color="#b45309"
          bg="#fef3c7"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          description="Successfully completed"
          icon={<CheckCircle size={22} />}
          color="#15803d"
          bg="#dcfce7"
        />
      </div>

      {/* Staff Team Tab */}
      {activeTab === 'staff-team' ? (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Users size={20} color="#0d9488" />
                Campus Maintenance Staff Directory
              </h2>
              <p className="section-subtitle">
                Registered technicians available for task dispatch
              </p>
            </div>
            <span className="badge badge-submitted">
              {staffList.length} Active Personnel
            </span>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Specialization & Department</th>
                  <th>Email Address</th>
                  <th>Contact Number</th>
                  <th style={{ textAlign: 'center' }}>Role Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <span className="ticket-id-tag">STF-{st.id.toString().padStart(3, '0')}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{st.name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                        <Briefcase size={14} color="#64748b" />
                        <span>{st.department || 'General Maintenance'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                        <Mail size={14} color="#64748b" />
                        <span>{st.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                        <Phone size={14} color="#64748b" />
                        <span>{st.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-badge assigned">
                        <span className="status-badge-dot" />
                        <span>Active Staff</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Complaints Console Tab */
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <ShieldCheck size={20} color="#0d9488" />
                Campus Complaint Dispatch & Management Console
              </h2>
              <p className="section-subtitle">
                Assign technicians, triage priorities, and supervise repair lifecycle
              </p>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Showing {complaints.length} tickets
            </span>
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            <form onSubmit={handleSearchSubmit} className="search-input-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search ticket code, title, student, or room..."
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

            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
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
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Fetching database records...</div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-wrap">
                  <Inbox size={30} />
                </div>
                <h3 className="empty-state-title">
                  {isFiltered ? 'No matching tickets found' : 'No maintenance tickets logged'}
                </h3>
                <p className="empty-state-text">
                  {isFiltered 
                    ? 'Adjust or clear your search criteria to view all tickets.' 
                    : 'When students or faculty log requests, they will show up here for staff assignment.'}
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
                    <th>Ticket Code</th>
                    <th>Issue & Category</th>
                    <th>Reported By</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician Assignment</th>
                    <th style={{ textAlign: 'center' }}>Manage</th>
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
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{item.user_name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.user_department || 'Student'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
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
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <select
                              className="filter-select"
                              style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                              value={assignStaffMap[item.id] || ''}
                              onChange={(e) =>
                                setAssignStaffMap({
                                  ...assignStaffMap,
                                  [item.id]: e.target.value,
                                })
                              }
                            >
                              <option value="">-- Assign Staff --</option>
                              {staffList.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.department?.split(' ')[0] || 'Staff'})
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              onClick={() => handleQuickAssign(item.id)}
                              disabled={assigningId === item.id || !assignStaffMap[item.id]}
                            >
                              Dispatch
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedComplaintId(item.id)}
                        >
                          <Eye size={14} /> Details
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

      {/* Details & Assignment Modal */}
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

export default AdminDashboard;
