const pool = require('../db');

const getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ride_history WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addEntry = async (req, res) => {
  const { date, earnings, trips, rating, weather } = req.body;
  const scoreImpact = rating >= 4.8 ? 5 : rating < 4.0 ? -5 : 0;

  try {
    const result = await pool.query(
      `INSERT INTO ride_history (user_id, date, earnings, trips, rating, score_impact, weather)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.userId, date, earnings, trips, rating, scoreImpact, weather || 'Normal']
    );

    // Update gig score
    await pool.query(
      `INSERT INTO gig_scores (user_id, score, updated_at)
       VALUES ($1, 742 + $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET score = gig_scores.score + $2, updated_at = NOW()`,
      [req.user.userId, scoreImpact]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory, addEntry };
