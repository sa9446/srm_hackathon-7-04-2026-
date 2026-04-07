const express = require('express');
const router = express.Router();
const { getScore, getLoan, getInsurance, recompute } = require('../controllers/score.controller');
const auth = require('../middleware/auth');

router.get('/',           auth, getScore);
router.get('/loan',       auth, getLoan);
router.get('/insurance',  auth, getInsurance);
router.post('/recompute', auth, recompute);

module.exports = router;
