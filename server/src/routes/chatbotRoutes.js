const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');
const { limitarPorUsuario } = require('../middleware/rateLimit');

router.post('/', auth, limitarPorUsuario({ max: 10, ventanaMs: 60000 }), chatbotController.preguntar);

module.exports = router;
