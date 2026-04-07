const express = require('express');
const router = express.Router();
const { startRide, stopRide, getRideStatus } = require('../controllers/ride.controller');
const authMiddleware = require('../middleware/auth');

router.get('/status', authMiddleware, getRideStatus);
router.post('/start', authMiddleware, startRide);
router.post('/stop', authMiddleware, stopRide);

module.exports = router;
