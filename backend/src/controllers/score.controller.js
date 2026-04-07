const pool = require('../db');

const getScore = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT score, updated_at FROM gig_scores WHERE user_id = $1',
      [req.user.userId]
    );
    const row = result.rows[0] || { score: 742 };
    res.json({
      score: row.score,
      max: 1000,
      label: row.score >= 800 ? 'Excellent' : row.score >= 650 ? 'Good' : 'Fair',
      riskLevel: row.score >= 750 ? 'Low' : row.score >= 600 ? 'Medium' : 'High',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLoanEligibility = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT score FROM gig_scores WHERE user_id = $1',
      [req.user.userId]
    );
    const score = result.rows[0]?.score || 742;

    let eligibility;
    if (score >= 800) eligibility = { tier: 'High', range: '₹75k - ₹1.5L' };
    else if (score >= 650) eligibility = { tier: 'Medium', range: '₹25k - ₹50k' };
    else eligibility = { tier: 'Low', range: 'Up to ₹10k' };

    res.json({ score, ...eligibility });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getScore, getLoanEligibility };
