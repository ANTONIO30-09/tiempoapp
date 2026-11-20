function limitarPorUsuario({ max = 10, ventanaMs = 60000 } = {}) {
  const registros = new Map();

  return function limitar(req, res, next) {
    const clave = req.usuario?.id || req.ip;
    const ahora = Date.now();
    const registro = registros.get(clave);

    if (!registro || ahora >= registro.reinicio) {
      registros.set(clave, { cuenta: 1, reinicio: ahora + ventanaMs });
      return next();
    }
    if (registro.cuenta >= max) {
      return res.status(429).json({ mensaje: 'Demasiadas preguntas. Espera un momento e intenta de nuevo.' });
    }
    registro.cuenta += 1;
    return next();
  };
}

module.exports = { limitarPorUsuario };
