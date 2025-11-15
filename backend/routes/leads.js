const express = require('express');
const router = express.Router();
const { auth, requireTier } = require('../middleware/auth');
const {
  getAllLeads,
  getGroupedLeads,
  getLeadById,
  createLead,
  assignLead,
  updateLeadStatus,
  addComment,
  getLeadComments,
  getLeadHistory
} = require('../controllers/leadsController');

// GET /api/leads
router.get('/', auth, getAllLeads);

// GET /api/leads/grouped
router.get('/grouped', auth, getGroupedLeads);

// GET /api/leads/:id
router.get('/:id', auth, getLeadById);

// POST /api/leads
router.post('/', auth, requireTier([1, 2]), createLead);

// PATCH /api/leads/:id/assign
router.patch('/:id/assign', auth, requireTier([1, 2]), assignLead);

// PATCH /api/leads/:id/status
router.patch('/:id/status', auth, updateLeadStatus);

// POST /api/leads/:id/comments
router.post('/:id/comments', auth, addComment);

// GET /api/leads/:id/comments
router.get('/:id/comments', auth, getLeadComments);

// GET /api/leads/:id/history
router.get('/:id/history', auth, getLeadHistory);

module.exports = router;