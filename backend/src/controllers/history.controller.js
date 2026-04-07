const pool = require('../db');
const { calculateGigScore } = require('../services/scoreEngine');

const getHistory = async (req, res) => {
  const { limit = 30, offset = 0 } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, date, earnings, trips, rating, score_impact, weather, platform_override, created_at
       FROM ride_history
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, Number(limit), Number(offset)]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addEntry = async (req, res) => {
  const { date, earnings, trips, rating, weather, platform_override } = req.body;

  if (!earnings || !trips || !rating) {
    return res.status(400).json({ error: 'earnings, trips, and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert the new entry
    const insertResult = await client.query(
      `INSERT INTO ride_history (user_id, date, earnings, trips, rating, weather, platform_override)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.userId,
        date || new Date().toISOString(),
        Number(earnings),
        Number(trips),
        Number(rating),
        weather || 'Normal',
        platform_override || null,
      ]
    );
    const newEntry = insertResult.rows[0];

    // Recalculate score from all history (last 90 days for relevance)
    const historyResult = await client.query(
      `SELECT earnings, trips, rating FROM ride_history
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '90 days'
       ORDER BY date DESC`,
      [req.user.userId]
    );

    const { score, breakdown } = calculateGigScore(historyResult.rows);

    // Get previous score to calculate impact
    const prevResult = await client.query(
      'SELECT score FROM gig_scores WHERE user_id = $1',
      [req.user.userId]
    );
    const prevScore = prevResult.rows[0]?.score || 500;
    const scoreImpact = score - prevScore;

    // Update the entry's score_impact
    await client.query(
      'UPDATE ride_history SET score_impact = $1 WHERE id = $2',
      [scoreImpact, newEntry.id]
    );

    // Upsert the gig score
    await client.query(
      `INSERT INTO gig_scores (user_id, score, breakdown, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET score = $2, breakdown = $3, updated_at = NOW()`,
      [req.user.userId, score, JSON.stringify(breakdown)]
    );

    await client.query('COMMIT');

    res.status(201).json({ ...newEntry, score_impact: scoreImpact, new_gig_score: score });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const deleteEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ride_history WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Entry not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory, addEntry, deleteEntry };
