const express = require('express');
const router = express.Router();
const { register, login, googleLogin } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login a user
router.post('/login', login);

// @route   POST api/auth/google
// @desc    Google OAuth login
router.post('/google', googleLogin);

module.exports = router;