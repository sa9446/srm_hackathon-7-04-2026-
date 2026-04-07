const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const PLATFORMS = ['Swiggy', 'Blinkit', 'Uber', 'Ola', 'Rapido', 'Zomato', 'Porter', 'Other'];

// Euclidean distance between two 128-d face descriptors
function faceDistance(a, b) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

const register = async (req, res) => {
  const { name, email, password, platform, phone, faceDescriptor } = req.body;

  if (!name || !email || !password || !platform)
    return res.status(400).json({ error: 'name, email, password, and platform are required' });
  if (!PLATFORMS.includes(platform))
    return res.status(400).json({ error: `platform must be one of: ${PLATFORMS.join(', ')}` });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, platform, phone, face_descriptor)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, platform, phone, created_at`,
      [name, email, password_hash, platform, phone || null, faceDescriptor || null]
    );

    const user = result.rows[0];
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
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, platform: user.platform } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const faceLogin = async (req, res) => {
  const { descriptor } = req.body;
  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128)
    return res.status(400).json({ error: 'Invalid face descriptor' });

  try {
    // Fetch all users who have registered a face
    const result = await pool.query(
      'SELECT id, name, email, platform, face_descriptor FROM users WHERE face_descriptor IS NOT NULL'
    );

    if (!result.rows.length)
      return res.status(404).json({ error: 'No faces registered. Please use email login.' });

    let bestMatch = null;
    let bestDist  = Infinity;

    for (const user of result.rows) {
      const dist = faceDistance(descriptor, user.face_descriptor);
      if (dist < bestDist) {
        bestDist  = dist;
        bestMatch = user;
      }
    }

    // Threshold: < 0.55 is a confident match (stricter than default 0.6)
    if (bestDist > 0.55)
      return res.status(401).json({ error: 'Face not recognised. Try again or use email login.' });

    const token = jwt.sign({ userId: bestMatch.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: bestMatch.id, name: bestMatch.name, email: bestMatch.email, platform: bestMatch.platform },
      confidence: Math.round((1 - bestDist) * 100),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.platform, u.phone, u.created_at,
              gs.score AS gig_score,
              (u.face_descriptor IS NOT NULL) AS face_registered
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

module.exports = { register, login, faceLogin, getProfile };
