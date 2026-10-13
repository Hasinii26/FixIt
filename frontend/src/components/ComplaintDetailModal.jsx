import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { 
  X, 
  MapPin, 
  Tag, 
  User, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';

const ComplaintDetailModal = ({ complaintId, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states for Admin assignment
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Form states for Staff/Admin status update
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notesError, setNotesError] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
    if (user?.role === 'admin') {
      fetchStaffList();
    }
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/complaints/${complaintId}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setNewStatus(res.data.complaint.status);
        setNewPriority(res.data.complaint.priority);
        if (res.data.complaint.staff_id) {
          setSelectedStaff(res.data.complaint.staff_id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await api.get('/users/staff');
      if (res.data.success) {
        setStaffList(res.data.staff);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  const copyCodeToClipboard = () => {
    if (complaint?.complaint_code) {
      navigator.clipboard.writeText(complaint.complaint_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      setAssigning(true);
      setError('');
      setActionSuccess('');
      const res = await api.put(`/complaints/${complaintId}/assign`, {
        staff_id: selectedStaff,
        notes: assignNotes.trim() || 'Dispatched by Administrator',
      });
      if (res.data.success) {
        setActionSuccess(res.data.message);
        setAssignNotes('');
        await fetchComplaintDetails();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusNotes.trim()) {
      setNotesError('Please enter notes or explanation for this status update.');
      return;
    }
    setNotesError('');

    try {
      setUpdating(true);
      setError('');
      setActionSuccess('');
      const payload = {
        status: newStatus,
        notes: statusNotes.trim(),
      };
      if (user?.role === 'admin') {
        payload.priority = newPriority;
      }
      const res = await api.put(`/complaints/${complaintId}/status`, payload);
      if (res.data.success) {
        setActionSuccess(res.data.message);
        setStatusNotes('');
        await fetchComplaintDetails();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (!complaintId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span 
              className="ticket-id-tag" 
              onClick={copyCodeToClipboard}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Click to copy ticket ID"
            >
              {complaint?.complaint_code || 'Loading...'}
              {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} color="#64748b" />}
            </span>
            <StatusBadge status={complaint?.status || 'Submitted'} />
            <PriorityBadge priority={complaint?.priority || 'Medium'} />
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div>Loading complaint records & timeline...</div>
            </div>
          ) : error && !complaint ? (
            <div className="alert alert-error">{error}</div>
          ) : complaint ? (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

              {/* Title & Metadata Header */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  {complaint.title}
                </h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.84rem', color: '#64748b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={14} color="#0d9488" /> {complaint.category}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#0d9488" /> {complaint.location}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="#0d9488" /> {new Date(complaint.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Problem Description Box */}
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Problem Description
                </div>
                <p style={{ fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {complaint.description}
                </p>
              </div>

              {/* Two Column Info Grid: Reporter & Assigned Staff */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    <User size={14} color="#0d9488" /> Reported By
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{complaint.user_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{complaint.user_email}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Dept / Hostel: <strong>{complaint.user_department || 'General Campus'}</strong>
                  </div>
                  {complaint.user_phone && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      Phone: {complaint.user_phone}
                    </div>
                  )}
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    <Wrench size={14} color="#0d9488" /> Assigned Technician
                  </div>
                  {complaint.staff_name ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0d9488' }}>
                        {complaint.staff_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{complaint.staff_email}</div>
                      {complaint.staff_phone && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Direct Phone: {complaint.staff_phone}
                        </div>
                      )}
                      {complaint.assignment_notes && (
                        <div style={{ fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', marginTop: '6px', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                          "{complaint.assignment_notes}"
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '12px' }}>
                      No technician has been assigned yet.
                    </div>
                  )}
                </div>
              </div>

              {/* ADMIN ACTION: Assign Staff */}
              {user?.role === 'admin' && (
                <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '18px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f766e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> Admin Controls: Assign or Reassign Maintenance Staff
                  </div>
                  <form onSubmit={handleAssignStaff}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label className="form-label">Select Specialist Staff</label>
                        <select
                          className="form-control"
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Specialist --</option>
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.department || 'Staff'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Dispatch Instructions / Notes</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Inspect junction box and test breaker"
                          value={assignNotes}
                          onChange={(e) => setAssignNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={assigning || !selectedStaff}>
                        {assigning ? 'Dispatching...' : 'Dispatch Specialist'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STAFF & ADMIN ACTION: Update Status & Technician Notes */}
              {(user?.role === 'admin' || (user?.role === 'staff' && complaint.staff_id === user.id)) && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={16} color="#0d9488" /> Update Status & Technician Log
                  </div>
                  <form onSubmit={handleUpdateStatus}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label className="form-label">New Status</label>
                        <select
                          className="form-control"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      {user?.role === 'admin' && (
                        <div>
                          <label className="form-label">Priority Override</label>
                          <select
                            className="form-control"
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value)}
                          >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                          </select>
                        </div>
                      )}

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">
                          <span>Technician Remarks / Progress Notes<span className="req">*</span></span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${notesError ? 'error' : ''}`}
                          placeholder="e.g. Replaced capacitor and verified circuit at 230V."
                          value={statusNotes}
                          onChange={(e) => {
                            setStatusNotes(e.target.value);
                            setNotesError('');
                          }}
                        />
                        {notesError && (
                          <div className="form-hint-error">
                            <AlertCircle size={12} /> {notesError}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-navy btn-sm" disabled={updating}>
                        {updating ? 'Saving...' : 'Save Progress Update'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Chronological Audit Trail & Timeline */}
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Audit Trail & Chronological Timeline
                </h3>
                {complaint.history && complaint.history.length > 0 ? (
                  <div className="timeline">
                    {complaint.history.map((h) => (
                      <div key={h.id} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-time">
                          {new Date(h.created_at).toLocaleString()} • <strong>{h.updated_by_name}</strong> ({h.updated_by_role})
                        </div>
                        <div className="timeline-content">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <StatusBadge status={h.status} />
                          </div>
                          {h.notes && <div style={{ fontSize: '0.86rem', color: '#334155' }}>{h.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>No history records logged yet.</div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;
