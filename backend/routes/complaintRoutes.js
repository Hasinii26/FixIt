const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  getComplaintStats,
} = require('../controllers/complaintController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All complaint routes require a valid JWT token
router.use(authenticateToken);

// Statistics
router.get('/stats', getComplaintStats);

// List and Create complaints
router.get('/', getComplaints);
router.post('/', createComplaint);

// Single complaint details
router.get('/:id', getComplaintById);

// Admin-only: Assign complaint to staff
router.put('/:id/assign', authorizeRoles('admin'), assignComplaint);

// Staff or Admin: Update complaint status / notes / priority
router.put('/:id/status', authorizeRoles('staff', 'admin'), updateComplaintStatus);

module.exports = router;
