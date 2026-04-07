const express = require('express');
const router = express.Router();
const { register, login, faceLogin, getProfile } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

router.post('/register',   register);
router.post('/login',      login);
router.post('/face-login', faceLogin);
router.get('/profile',     authMiddleware, getProfile);

module.exports = router;
