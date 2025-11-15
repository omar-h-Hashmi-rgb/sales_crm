const express = require('express');
const router = express.Router();
const { auth, requireTier } = require('../middleware/auth');
const { getAllUsers } = require('../controllers/usersController');

// GET /api/users
router.get('/', auth, requireTier([1, 2]), getAllUsers);

module.exports = router;