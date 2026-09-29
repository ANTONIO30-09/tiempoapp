const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const auth = require('../middleware/auth');

router.post('/', auth, publicacionController.crear);
router.get('/', auth, publicacionController.listar);
router.get('/:id', auth, publicacionController.obtenerPorId);
router.put('/:id', auth, publicacionController.actualizar);
router.delete('/:id', auth, publicacionController.eliminar);

module.exports = router;
