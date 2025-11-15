const pool = require('../config/database');
const { leadSchema, statusSchema, assignmentSchema, commentSchema } = require('../utils/validation');

const getAllLeads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      source, 
      assigned_to, 
      search,
      date_from,
      date_to,
      tier_filter
    } = req.query;

    let query = `
      SELECT 
        l.*,
        u.name as assigned_to_name,
        u.tier_level as assigned_to_tier_level,
        ab.name as assigned_by_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to_user_id = u.id
      LEFT JOIN users ab ON l.assigned_by_user_id = ab.id
      WHERE l.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;

    // Apply filters
    if (status) {
      paramCount++;
      query += ` AND l.status = $${paramCount}`;
      params.push(status);
    }

    if (source) {
      paramCount++;
      query += ` AND l.source = $${paramCount}`;
      params.push(source);
    }

    if (assigned_to) {
      paramCount++;
      query += ` AND l.assigned_to_user_id = $${paramCount}`;
      params.push(assigned_to);
    }

    if (tier_filter) {
      paramCount++;
      query += ` AND l.assigned_to_tier = $${paramCount}`;
      params.push(tier_filter);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        l.name ILIKE $${paramCount} OR 
        l.phone ILIKE $${paramCount} OR 
        l.email ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    if (date_from) {
      paramCount++;
      query += ` AND l.created_at >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND l.created_at <= $${paramCount}`;
      params.push(date_to);
    }

    // Add pagination
    query += ` ORDER BY l.created_at DESC`;
    
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM leads l 
      WHERE l.is_active = true
    `;
    
    // Apply same filters to count
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND l.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (source) {
      countParamCount++;
      countQuery += ` AND l.source = $${countParamCount}`;
      countParams.push(source);
    }

    if (assigned_to) {
      countParamCount++;
      countQuery += ` AND l.assigned_to_user_id = $${countParamCount}`;
      countParams.push(assigned_to);
    }

    if (tier_filter) {
      countParamCount++;
      countQuery += ` AND l.assigned_to_tier = $${countParamCount}`;
      countParams.push(tier_filter);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        l.name ILIKE $${countParamCount} OR 
        l.phone ILIKE $${countParamCount} OR 
        l.email ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }

    if (date_from) {
      countParamCount++;
      countQuery += ` AND l.created_at >= $${countParamCount}`;
      countParams.push(date_from);
    }

    if (date_to) {
      countParamCount++;
      countQuery += ` AND l.created_at <= $${countParamCount}`;
      countParams.push(date_to);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      leads: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGroupedLeads = async (req, res) => {
  try {
    const { by } = req.query;

    if (!['location', 'service'].includes(by)) {
      return res.status(400).json({ error: 'Invalid grouping parameter. Use "location" or "service"' });
    }

    let query;
    if (by === 'location') {
      query = `
        SELECT 
          l.location,
          COUNT(*) as count,
          json_agg(
            json_build_object(
              'id', l.id,
              'name', l.name,
              'phone', l.phone,
              'email', l.email,
              'status', l.status,
              'source', l.source,
              'is_fresh', l.is_fresh,
              'assigned_to_name', u.name,
              'created_at', l.created_at
            ) ORDER BY l.created_at DESC
          ) as leads
        FROM leads l
        LEFT JOIN users u ON l.assigned_to_user_id = u.id
        WHERE l.is_active = true
        GROUP BY l.location
        ORDER BY count DESC, l.location
      `;
    } else {
      query = `
        SELECT 
          l.service_category as category,
          COUNT(*) as count,
          json_agg(
            json_build_object(
              'id', l.id,
              'name', l.name,
              'phone', l.phone,
              'email', l.email,
              'status', l.status,
              'source', l.source,
              'is_fresh', l.is_fresh,
              'services', l.services,
              'assigned_to_name', u.name,
              'created_at', l.created_at
            ) ORDER BY l.created_at DESC
          ) as leads
        FROM leads l
        LEFT JOIN users u ON l.assigned_to_user_id = u.id
        WHERE l.is_active = true
        GROUP BY l.service_category
        ORDER BY count DESC, l.service_category
      `;
    }

    const result = await pool.query(query);

    res.json({
      groups: result.rows
    });
  } catch (error) {
    console.error('Get grouped leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        l.*,
        u.name as assigned_to_name,
        u.tier_level as assigned_to_tier_level,
        ab.name as assigned_by_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to_user_id = u.id
      LEFT JOIN users ab ON l.assigned_by_user_id = ab.id
      WHERE l.id = $1 AND l.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ lead: result.rows[0] });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createLead = async (req, res) => {
  try {
    const { error } = leadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      name,
      phone,
      email,
      location,
      address,
      services,
      service_category,
      notes,
      source,
      source_campaign_id,
      source_ad_id
    } = req.body;

    // Check for duplicate phone number
    const duplicateCheck = await pool.query(
      'SELECT id, name FROM leads WHERE phone = $1 AND is_active = true',
      [phone]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Lead with this phone number already exists',
        duplicate_lead: duplicateCheck.rows[0]
      });
    }

    const result = await pool.query(`
      INSERT INTO leads (
        name, phone, email, location, address, services, service_category,
        notes, source, source_campaign_id, source_ad_id, is_fresh, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, 'new')
      RETURNING *
    `, [
      name, phone, email || null, location || null, address || null,
      services || [], service_category || null, notes || null,
      source, source_campaign_id || null, source_ad_id || null
    ]);

    res.status(201).json({ lead: result.rows[0] });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const assignLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = assignmentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { assigned_to_user_id } = req.body;

    // Check if user has permission (Tier 1 or 2)
    if (![1, 2].includes(req.user.tier_level)) {
      return res.status(403).json({ error: 'Only Admin and Area Managers can assign leads' });
    }

    // Get the lead
    const leadResult = await pool.query(
      'SELECT * FROM leads WHERE id = $1 AND is_active = true',
      [id]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Get the user to assign to
    const userResult = await pool.query(
      'SELECT id, tier_level FROM users WHERE id = $1',
      [assigned_to_user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const assignToUser = userResult.rows[0];

    // Update the lead
    const updateResult = await pool.query(`
      UPDATE leads SET
        assigned_to_user_id = $1,
        assigned_to_tier = $2,
        assigned_at = NOW(),
        assigned_by_user_id = $3,
        is_fresh = false,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [assigned_to_user_id, assignToUser.tier_level, req.user.id, id]);

    res.json({ 
      lead: updateResult.rows[0],
      message: 'Lead assigned successfully'
    });
  } catch (error) {
    console.error('Assign lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = statusSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status, notes } = req.body;

    // Get the lead
    const leadResult = await pool.query(
      'SELECT * FROM leads WHERE id = $1 AND is_active = true',
      [id]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    // Check permissions
    const isAssignedUser = lead.assigned_to_user_id === req.user.id;
    const isAdminOrAreaManager = [1, 2].includes(req.user.tier_level);

    if (!isAssignedUser && !isAdminOrAreaManager) {
      return res.status(403).json({ 
        error: 'You can only update status of leads assigned to you' 
      });
    }

    // If lead is fresh, only allow assignment
    if (lead.is_fresh) {
      return res.status(400).json({ 
        error: 'Cannot update status of fresh leads. Please assign first.' 
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update lead status
      let updateQuery = `
        UPDATE leads SET
          status = $1,
          updated_at = NOW()
      `;
      let params = [status];

      // If status is 'contacted', update last_contacted_at
      if (status === 'contacted') {
        updateQuery += ', last_contacted_at = NOW()';
      }

      updateQuery += ' WHERE id = $2 RETURNING *';
      params.push(id);

      const updateResult = await client.query(updateQuery, params);

      // Insert into status history
      await client.query(`
        INSERT INTO lead_status_history (
          lead_id, old_status, new_status, changed_by_user_id, notes
        ) VALUES ($1, $2, $3, $4, $5)
      `, [id, lead.status, status, req.user.id, notes || null]);

      await client.query('COMMIT');

      res.json({ 
        lead: updateResult.rows[0],
        message: 'Lead status updated successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = commentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { comment } = req.body;

    // Get the lead
    const leadResult = await pool.query(
      'SELECT * FROM leads WHERE id = $1 AND is_active = true',
      [id]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    // Check permissions
    const isAssignedUser = lead.assigned_to_user_id === req.user.id;
    const isAdminOrAreaManager = [1, 2].includes(req.user.tier_level);

    if (!isAssignedUser && !isAdminOrAreaManager) {
      return res.status(403).json({ 
        error: 'You can only add comments to leads assigned to you' 
      });
    }

    const result = await pool.query(`
      INSERT INTO lead_comments (lead_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, req.user.id, comment]);

    // Get the comment with user info
    const commentResult = await pool.query(`
      SELECT 
        lc.*,
        u.name as user_name
      FROM lead_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({ 
      comment: commentResult.rows[0],
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLeadComments = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        lc.*,
        u.name as user_name
      FROM lead_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.lead_id = $1
      ORDER BY lc.created_at DESC
    `, [id]);

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLeadHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        lsh.*,
        u.name as changed_by_name
      FROM lead_status_history lsh
      JOIN users u ON lsh.changed_by_user_id = u.id
      WHERE lsh.lead_id = $1
      ORDER BY lsh.created_at DESC
    `, [id]);

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllLeads,
  getGroupedLeads,
  getLeadById,
  createLead,
  assignLead,
  updateLeadStatus,
  addComment,
  getLeadComments,
  getLeadHistory
};