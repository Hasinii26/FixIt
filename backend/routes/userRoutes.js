const express = require('express');
const router = express.Router();
const { getStaffUsers, getAllUsers } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Admin-accessible route to get staff for assignment
router.get('/staff', authorizeRoles('admin'), getStaffUsers);

// Admin-accessible route to view all users
router.get('/', authorizeRoles('admin'), getAllUsers);

module.exports = router;
