const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const PLATFORMS = ['Swiggy', 'Blinkit', 'Uber', 'Ola', 'Rapido', 'Zomato', 'Porter', 'Other'];

const register = async (req, res) => {
  const { name, email, password, platform, phone } = req.body;

  if (!name || !email || !password || !platform) {
    return res.status(400).json({ error: 'name, email, password, and platform are required' });
  }
  if (!PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: `platform must be one of: ${PLATFORMS.join(', ')}` });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, platform, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, platform, phone, created_at`,
      [name, email, password_hash, platform, phone || null]
    );

    const user = result.rows[0];
    // Seed an initial gig score row
    await pool.query(
      'INSERT INTO gig_scores (user_id, score) VALUES ($1, 500) ON CONFLICT DO NOTHING',
      [user.id]
    );

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, platform: user.platform, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.platform, u.phone, u.created_at,
              gs.score AS gig_score
       FROM users u
       LEFT JOIN gig_scores gs ON gs.user_id = u.id
       WHERE u.id = $1`,
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile };
