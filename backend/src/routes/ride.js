const express = require('express');
const router = express.Router();
const { getRideStatus, startRide, stopRide, getRideHistory } = require('../controllers/ride.controller');
const auth = require('../middleware/auth');

router.get('/status',  auth, getRideStatus);
router.get('/history', auth, getRideHistory);
router.post('/start',  auth, startRide);
router.post('/stop',   auth, stopRide);

module.exports = router;
