const express = require('express');
const router = express.Router();
const { getHistory, addEntry } = require('../controllers/history.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getHistory);
router.post('/', authMiddleware, addEntry);

module.exports = router;
