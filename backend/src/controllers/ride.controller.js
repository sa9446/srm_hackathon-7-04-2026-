const pool = require('../db');

const getRideStatus = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, is_active, started_at, ended_at,
              EXTRACT(EPOCH FROM (NOW() - started_at))::int AS duration_seconds
       FROM ride_sessions
       WHERE user_id = $1
       ORDER BY started_at DESC
       LIMIT 1`,
      [req.user.userId]
    );
    res.json(result.rows[0] || { is_active: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startRide = async (req, res) => {
  try {
    // Close any open session first
    await pool.query(
      `UPDATE ride_sessions SET is_active = false, ended_at = NOW()
       WHERE user_id = $1 AND is_active = true`,
      [req.user.userId]
    );

    const result = await pool.query(
      `INSERT INTO ride_sessions (user_id, is_active, started_at)
       VALUES ($1, true, NOW())
       RETURNING id, is_active, started_at`,
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
      `UPDATE ride_sessions
       SET is_active = false, ended_at = NOW()
       WHERE user_id = $1 AND is_active = true
       RETURNING id, started_at, ended_at,
                 EXTRACT(EPOCH FROM (ended_at - started_at))::int AS duration_seconds`,
      [req.user.userId]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'No active ride session' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRideHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, started_at, ended_at,
              EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at))::int AS duration_seconds
       FROM ride_sessions
       WHERE user_id = $1
       ORDER BY started_at DESC
       LIMIT 20`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRideStatus, startRide, stopRide, getRideHistory };
