const pool = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, tier_level, created_at
      FROM users
      ORDER BY tier_level, name
    `);

    // Group users by tier for easier UI rendering
    const groupedUsers = {
      1: [], // Admin
      2: [], // Area Manager
      3: [], // Store Manager
      4: []  // Sales Rep
    };

    result.rows.forEach(user => {
      if (groupedUsers[user.tier_level]) {
        groupedUsers[user.tier_level].push(user);
      }
    });

    res.json({ 
      users: result.rows,
      grouped_users: groupedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers
};