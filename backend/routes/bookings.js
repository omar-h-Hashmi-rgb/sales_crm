const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createBooking, getAllBookings } = require('../controllers/bookingsController');

// POST /api/bookings
router.post('/', auth, createBooking);

// GET /api/bookings
router.get('/', auth, getAllBookings);

module.exports = router;