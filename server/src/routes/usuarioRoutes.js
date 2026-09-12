const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/auth');

router.get('/', auth, usuarioController.listar);
router.get('/:id', auth, usuarioController.obtenerPorId);
router.put('/:id', auth, usuarioController.actualizar);
router.delete('/:id', auth, usuarioController.eliminar);

module.exports = router;
