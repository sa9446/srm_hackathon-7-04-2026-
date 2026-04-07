const pool = require('../db');
const { calculateGigScore, getLoanEligibility, getInsuranceTier } = require('../services/scoreEngine');

const getScore = async (req, res) => {
  try {
    // Pull the stored score (kept in sync by history controller)
    const result = await pool.query(
      'SELECT score, breakdown, updated_at FROM gig_scores WHERE user_id = $1',
      [req.user.userId]
    );

    if (!result.rows.length) {
      return res.json({
        score: 500, max: 1000, label: 'No Data', riskLevel: 'Unknown',
        breakdown: {}, loan: getLoanEligibility(500), insurance: getInsuranceTier(500),
      });
    }

    const { score, breakdown, updated_at } = result.rows[0];
    const parsed = typeof breakdown === 'string' ? JSON.parse(breakdown) : breakdown || {};

    // Score trend: compare current score to score 7 days ago (approximate via history)
    const trendResult = await pool.query(
      `SELECT score_impact FROM ride_history
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '7 days'
       ORDER BY date`,
      [req.user.userId]
    );
    const weeklyDelta = trendResult.rows.reduce((sum, r) => sum + Number(r.score_impact), 0);

    res.json({
      score,
      max: 1000,
      label:     score >= 800 ? 'Excellent' : score >= 650 ? 'Good' : score >= 450 ? 'Fair' : 'Poor',
      riskLevel: score >= 750 ? 'Low' : score >= 550 ? 'Medium' : 'High',
      weeklyDelta,
      updatedAt: updated_at,
      breakdown: {
        rating:      { score: parsed.rating      || 0, max: 250, label: 'Customer Rating' },
        consistency: { score: parsed.consistency || 0, max: 200, label: 'Income Consistency' },
        volume:      { score: parsed.volume      || 0, max: 200, label: 'Earnings Volume' },
        activity:    { score: parsed.activity    || 0, max: 200, label: 'Trip Activity' },
        tenure:      { score: parsed.tenure      || 0, max: 150, label: 'Tracking Tenure' },
      },
      loan:      getLoanEligibility(score),
      insurance: getInsuranceTier(score),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLoan = async (req, res) => {
  try {
    const result = await pool.query('SELECT score FROM gig_scores WHERE user_id = $1', [req.user.userId]);
    const score = result.rows[0]?.score || 500;
    res.json({ score, ...getLoanEligibility(score) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInsurance = async (req, res) => {
  try {
    const result = await pool.query('SELECT score FROM gig_scores WHERE user_id = $1', [req.user.userId]);
    const score = result.rows[0]?.score || 500;
    res.json({ score, ...getInsuranceTier(score) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recompute score on demand from raw history (useful for debugging / admin)
const recompute = async (req, res) => {
  try {
    const historyResult = await pool.query(
      `SELECT earnings, trips, rating FROM ride_history
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '90 days'
       ORDER BY date DESC`,
      [req.user.userId]
    );

    const { score, breakdown, label, riskLevel } = calculateGigScore(historyResult.rows);

    await pool.query(
      `INSERT INTO gig_scores (user_id, score, breakdown, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET score = $2, breakdown = $3, updated_at = NOW()`,
      [req.user.userId, score, JSON.stringify(breakdown)]
    );

    res.json({ score, breakdown, label, riskLevel, recomputed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getScore, getLoan, getInsurance, recompute };
