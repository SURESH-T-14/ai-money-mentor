const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chat } = require('../controllers/aiController');

// POST /api/ai/chat - money management advisor
router.post('/chat', auth, chat);

module.exports = router;
