/**
 * Gig Score Engine
 * Computes a 0–1000 creditworthiness score for gig workers (Swiggy, Blinkit, Uber, Ola, Rapido, etc.)
 * based on their logged earnings, trips, and ratings.
 *
 * Score Breakdown (max 1000):
 *   Rating Score       — 250 pts  (customer satisfaction proxy)
 *   Consistency Score  — 200 pts  (stable income = lower default risk)
 *   Volume Score       — 200 pts  (absolute earning capacity)
 *   Activity Score     — 200 pts  (trip frequency / work ethic)
 *   Tenure Score       — 150 pts  (length of trackable history)
 */

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const variance = arr.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * @param {Array} historyRows - rows from ride_history table
 * @returns {{ score, breakdown, label, riskLevel }}
 */
function calculateGigScore(historyRows) {
  if (!historyRows || historyRows.length === 0) {
    return {
      score: 500,
      breakdown: { rating: 0, consistency: 0, volume: 0, activity: 0, tenure: 0 },
      label: 'No Data',
      riskLevel: 'Unknown',
    };
  }

  const earnings = historyRows.map(r => Number(r.earnings));
  const trips    = historyRows.map(r => Number(r.trips));
  const ratings  = historyRows.map(r => Number(r.rating));

  // 1. Rating Score (0–250)
  //    5.0 → 250, 4.0 → 187, 3.0 → 125, 1.0 → 0
  const avgRating = mean(ratings);
  const ratingScore = Math.round(((avgRating - 1) / 4) * 250);

  // 2. Consistency Score (0–200)
  //    Coefficient of variation: lower variance = more consistent income
  const avgEarnings = mean(earnings);
  const cv = avgEarnings > 0 ? stdDev(earnings) / avgEarnings : 1;
  // cv = 0 → perfect consistency (200pts); cv ≥ 1 → very inconsistent (0pts)
  const consistencyScore = Math.round(Math.max(0, (1 - Math.min(cv, 1)) * 200));

  // 3. Volume Score (0–200)
  //    ₹2000/day avg → 200pts; ₹1000 → 100pts; scales linearly up to ₹2000
  const volumeScore = Math.round(Math.min(200, (avgEarnings / 2000) * 200));

  // 4. Activity Score (0–200)
  //    15 trips/day avg → 200pts; scales linearly
  const avgTrips = mean(trips);
  const activityScore = Math.round(Math.min(200, (avgTrips / 15) * 200));

  // 5. Tenure Score (0–150)
  //    Every tracked day adds 5pts, capped at 150 (30 days)
  const tenureScore = Math.min(150, historyRows.length * 5);

  const score = Math.min(
    1000,
    ratingScore + consistencyScore + volumeScore + activityScore + tenureScore
  );

  return {
    score,
    breakdown: { rating: ratingScore, consistency: consistencyScore, volume: volumeScore, activity: activityScore, tenure: tenureScore },
    label:     score >= 800 ? 'Excellent' : score >= 650 ? 'Good' : score >= 450 ? 'Fair' : 'Poor',
    riskLevel: score >= 750 ? 'Low' : score >= 550 ? 'Medium' : 'High',
  };
}

/**
 * @param {number} score
 * @returns {{ tier, minAmount, maxAmount, interestRate, display }}
 */
function getLoanEligibility(score) {
  if (score >= 800) {
    return { tier: 'High',   minAmount: 75000,  maxAmount: 150000, interestRate: 12, display: '₹75,000 – ₹1,50,000' };
  } else if (score >= 650) {
    return { tier: 'Medium', minAmount: 25000,  maxAmount: 50000,  interestRate: 16, display: '₹25,000 – ₹50,000' };
  } else if (score >= 450) {
    return { tier: 'Low',    minAmount: 5000,   maxAmount: 10000,  interestRate: 22, display: '₹5,000 – ₹10,000' };
  } else {
    return { tier: 'None',   minAmount: 0,      maxAmount: 0,      interestRate: 0,  display: 'Not eligible' };
  }
}

/**
 * @param {number} score
 * @returns {{ plan, coverage, premium, status }}
 */
function getInsuranceTier(score) {
  if (score >= 800) {
    return { plan: 'Premium', coverage: '₹10,00,000', premium: '₹499/month', status: 'Eligible' };
  } else if (score >= 600) {
    return { plan: 'Standard', coverage: '₹5,00,000', premium: '₹299/month', status: 'Eligible' };
  } else if (score >= 400) {
    return { plan: 'Basic',    coverage: '₹2,00,000', premium: '₹149/month', status: 'Eligible' };
  } else {
    return { plan: 'None',     coverage: '—',          premium: '—',          status: 'Not Eligible' };
  }
}

module.exports = { calculateGigScore, getLoanEligibility, getInsuranceTier };
