const pool = require('../config/database');
const { bookingSchema } = require('../utils/validation');

const createBooking = async (req, res) => {
  try {
    const { error } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      customer_name,
      customer_phone,
      customer_email,
      location,
      services,
      date,
      time_slot
    } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if there's an active lead with this phone number
      const leadResult = await client.query(
        'SELECT * FROM leads WHERE phone = $1 AND is_active = true AND status != $2',
        [customer_phone, 'converted']
      );

      let leadId = null;
      let isConversion = false;

      if (leadResult.rows.length > 0) {
        const lead = leadResult.rows[0];
        leadId = lead.id;
        isConversion = true;

        // Mark lead as converted
        await client.query(`
          UPDATE leads SET
            status = 'converted',
            converted_at = NOW(),
            updated_at = NOW()
          WHERE id = $1
        `, [lead.id]);

        // Add to status history
        await client.query(`
          INSERT INTO lead_status_history (
            lead_id, old_status, new_status, changed_by_user_id, notes
          ) VALUES ($1, $2, 'converted', $3, 'Auto-converted via booking creation')
        `, [lead.id, lead.status, req.user.id]);
      }

      // Create booking
      const bookingResult = await client.query(`
        INSERT INTO bookings (
          customer_name,
          customer_phone,
          customer_email,
          location,
          services,
          date,
          time_slot,
          lead_id,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING *
      `, [
        customer_name,
        customer_phone,
        customer_email || null,
        location,
        services,
        date,
        time_slot,
        leadId
      ]);

      const booking = bookingResult.rows[0];

      // If conversion happened, update lead with booking reference
      if (isConversion && leadId) {
        await client.query(
          'UPDATE leads SET converted_to_booking_id = $1 WHERE id = $2',
          [booking.id, leadId]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        booking,
        conversion: isConversion,
        lead_id: leadId,
        message: isConversion ? 'Booking created and lead converted!' : 'Booking created successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        b.*,
        l.name as lead_name
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createBooking,
  getAllBookings
};