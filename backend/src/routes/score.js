const express = require('express');
const router = express.Router();
const { getScore, getLoanEligibility } = require('../controllers/score.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getScore);
router.get('/loan', authMiddleware, getLoanEligibility);

module.exports = router;
