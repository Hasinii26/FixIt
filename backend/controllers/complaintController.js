const { pool } = require('../config/db');

// Helper to generate unique complaint code e.g. FIX-2026-7842
const generateComplaintCode = () => {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `FIX-${randomPart}`;
};

// 1. Submit a new complaint
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority = 'Medium' } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location are required.',
      });
    }

    const validCategories = ['Electrical', 'Plumbing', 'Internet', 'Cleaning', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const assignedPriority = validPriorities.includes(priority) ? priority : 'Medium';

    const complaintCode = generateComplaintCode();

    const [result] = await pool.query(
      `INSERT INTO complaints (complaint_code, user_id, title, description, category, location, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
      [complaintCode, userId, title, description, category, location, assignedPriority]
    );

    const complaintId = result.insertId;

    // Log in history
    await pool.query(
      `INSERT INTO complaint_history (complaint_id, updated_by, status, notes)
       VALUES (?, ?, 'Submitted', 'Complaint submitted by user.')`,
      [complaintId, userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint: {
        id: complaintId,
        complaint_code: complaintCode,
        title,
        description,
        category,
        location,
        priority: assignedPriority,
        status: 'Submitted',
      },
    });
  } catch (error) {
    console.error('[createComplaint] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint.',
      error: error.message,
    });
  }
};

// 2. Get complaints list (Role-filtered with search and category/status filter)
const getComplaints = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { status, category, priority, search } = req.query;

    let query = `
      SELECT 
        c.id,
        c.complaint_code,
        c.title,
        c.description,
        c.category,
        c.location,
        c.priority,
        c.status,
        c.created_at,
        c.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.department AS user_department,
        staff.id AS staff_id,
        staff.name AS staff_name,
        staff.email AS staff_email,
        a.notes AS assignment_notes
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN assignments a ON c.id = a.complaint_id
      LEFT JOIN users staff ON a.staff_id = staff.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based filtering
    if (role === 'user') {
      query += ' AND c.user_id = ?';
      params.push(userId);
    } else if (role === 'staff') {
      query += ' AND a.staff_id = ?';
      params.push(userId);
    }
    // Admin sees all complaints

    // Optional query filters
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }
    if (priority) {
      query += ' AND c.priority = ?';
      params.push(priority);
    }
    if (search) {
      query += ' AND (c.complaint_code LIKE ? OR c.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      complaints: rows,
    });
  } catch (error) {
    console.error('[getComplaints] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints.',
      error: error.message,
    });
  }
};

// 3. Get complaint details with timeline history
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const [rows] = await pool.query(
      `SELECT 
        c.*,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.department AS user_department,
        staff.id AS staff_id,
        staff.name AS staff_name,
        staff.email AS staff_email,
        staff.phone AS staff_phone,
        a.notes AS assignment_notes,
        a.assigned_at
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN assignments a ON c.id = a.complaint_id
      LEFT JOIN users staff ON a.staff_id = staff.id
      WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const complaint = rows[0];

    // Check authorization: User can only see their own
    if (role === 'user' && complaint.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own complaints.',
      });
    }

    // Fetch timeline history
    const [history] = await pool.query(
      `SELECT 
        h.id,
        h.status,
        h.notes,
        h.created_at,
        u.name AS updated_by_name,
        u.role AS updated_by_role
      FROM complaint_history h
      JOIN users u ON h.updated_by = u.id
      WHERE h.complaint_id = ?
      ORDER BY h.created_at ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      complaint: {
        ...complaint,
        history,
      },
    });
  } catch (error) {
    console.error('[getComplaintById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint details.',
      error: error.message,
    });
  }
};

// 4. Assign complaint to staff (Admin only)
const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id, notes } = req.body;
    const adminId = req.user.id;

    if (!staff_id) {
      return res.status(400).json({
        success: false,
        message: 'staff_id is required.',
      });
    }

    // Verify staff user exists and has role 'staff'
    const [staffUsers] = await pool.query(
      'SELECT id, name FROM users WHERE id = ? AND role = "staff"',
      [staff_id]
    );

    if (staffUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an active staff member.',
      });
    }

    // Check complaint exists
    const [complaints] = await pool.query('SELECT id, status FROM complaints WHERE id = ?', [id]);
    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Check if already assigned or insert
    const [existingAssignment] = await pool.query(
      'SELECT id FROM assignments WHERE complaint_id = ?',
      [id]
    );

    if (existingAssignment.length > 0) {
      await pool.query(
        'UPDATE assignments SET staff_id = ?, assigned_by = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?',
        [staff_id, adminId, notes || 'Reassigned to staff member.', id]
      );
    } else {
      await pool.query(
        'INSERT INTO assignments (complaint_id, staff_id, assigned_by, notes) VALUES (?, ?, ?, ?)',
        [id, staff_id, adminId, notes || 'Assigned to staff member.']
      );
    }

    // Update complaint status to Assigned if it was Submitted
    const newStatus = complaints[0].status === 'Submitted' ? 'Assigned' : complaints[0].status;
    await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [newStatus, id]);

    // Record history
    await pool.query(
      `INSERT INTO complaint_history (complaint_id, updated_by, status, notes)
       VALUES (?, ?, ?, ?)`,
      [id, adminId, newStatus, `Assigned to ${staffUsers[0].name}. ${notes ? `Note: ${notes}` : ''}`]
    );

    return res.status(200).json({
      success: true,
      message: `Complaint assigned to ${staffUsers[0].name} successfully!`,
      status: newStatus,
    });
  } catch (error) {
    console.error('[assignComplaint] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign complaint.',
      error: error.message,
    });
  }
};

// 5. Update complaint status / priority (Staff or Admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, notes } = req.body;
    const { role, id: userId, name: userName } = req.user;

    const [complaints] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const complaint = complaints[0];

    // Check permissions
    if (role === 'staff') {
      // Staff can only update complaints assigned to them
      const [assigned] = await pool.query(
        'SELECT id FROM assignments WHERE complaint_id = ? AND staff_id = ?',
        [id, userId]
      );
      if (assigned.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this complaint.',
        });
      }
    }

    const validStatuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
    const updatedStatus = status && validStatuses.includes(status) ? status : complaint.status;

    const validPriorities = ['Low', 'Medium', 'High'];
    // Only admin can change priority
    const updatedPriority = role === 'admin' && priority && validPriorities.includes(priority)
      ? priority
      : complaint.priority;

    await pool.query(
      'UPDATE complaints SET status = ?, priority = ? WHERE id = ?',
      [updatedStatus, updatedPriority, id]
    );

    // Record in history
    const historyNote = notes || `Status updated to "${updatedStatus}" by ${userName} (${role}).`;
    await pool.query(
      'INSERT INTO complaint_history (complaint_id, updated_by, status, notes) VALUES (?, ?, ?, ?)',
      [id, userId, updatedStatus, historyNote]
    );

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully!',
      status: updatedStatus,
      priority: updatedPriority,
    });
  } catch (error) {
    console.error('[updateComplaintStatus] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint.',
      error: error.message,
    });
  }
};

// 6. Get dashboard statistics
const getComplaintStats = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let baseQuery = '';
    const params = [];

    if (role === 'user') {
      baseQuery = 'WHERE user_id = ?';
      params.push(userId);
    } else if (role === 'staff') {
      baseQuery = 'WHERE id IN (SELECT complaint_id FROM assignments WHERE staff_id = ?)';
      params.push(userId);
    }

    const [counts] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END), 0) AS submitted,
        COALESCE(SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END), 0) AS assigned,
        COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) AS in_progress,
        COALESCE(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END), 0) AS resolved
      FROM complaints ${baseQuery}`,
      params
    );

    const stats = {
      total: Number(counts[0].total) || 0,
      submitted: Number(counts[0].submitted) || 0,
      assigned: Number(counts[0].assigned) || 0,
      in_progress: Number(counts[0].in_progress) || 0,
      resolved: Number(counts[0].resolved) || 0,
      pending: (Number(counts[0].submitted) || 0) + (Number(counts[0].assigned) || 0),
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[getComplaintStats] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics.',
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  getComplaintStats,
};
