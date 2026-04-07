const pool = require('../db');

const getRideStatus = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT is_active, started_at FROM ride_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1',
      [req.user.userId]
    );
    res.json(result.rows[0] || { is_active: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startRide = async (req, res) => {
  try {
    await pool.query(
      'UPDATE ride_sessions SET is_active = false WHERE user_id = $1',
      [req.user.userId]
    );
    const result = await pool.query(
      'INSERT INTO ride_sessions (user_id, is_active, started_at) VALUES ($1, true, NOW()) RETURNING *',
      [req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const stopRide = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE ride_sessions SET is_active = false, ended_at = NOW() WHERE user_id = $1 AND is_active = true RETURNING *',
      [req.user.userId]
    );
    res.json(result.rows[0] || { message: 'No active ride' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRideStatus, startRide, stopRide };
