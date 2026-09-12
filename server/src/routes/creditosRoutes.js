const express = require('express');
const router = express.Router();
const creditosController = require('../controllers/creditosController');
const auth = require('../middleware/auth');

router.post('/transferir', auth, creditosController.transferir);
router.get('/historial', auth, creditosController.historial);
router.get('/saldo', auth, creditosController.saldo);

module.exports = router;
