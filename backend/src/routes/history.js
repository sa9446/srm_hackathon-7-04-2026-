const express = require('express');
const router = express.Router();
const { getHistory, addEntry, deleteEntry } = require('../controllers/history.controller');
const auth = require('../middleware/auth');

router.get('/',        auth, getHistory);
router.post('/',       auth, addEntry);
router.delete('/:id',  auth, deleteEntry);

module.exports = router;
