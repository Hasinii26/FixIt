const { pool } = require('../config/db');

// Get all staff members (for assignment dropdown)
const getStaffUsers = async (req, res) => {
  try {
    const [staff] = await pool.query(
      'SELECT id, name, email, phone, department FROM users WHERE role = "staff" ORDER BY name ASC'
    );
    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error('[getStaffUsers] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve staff list.',
      error: error.message,
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone, department, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('[getAllUsers] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user list.',
      error: error.message,
    });
  }
};

module.exports = {
  getStaffUsers,
  getAllUsers,
};
