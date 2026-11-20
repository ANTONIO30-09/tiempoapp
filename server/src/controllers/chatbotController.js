const chatbotService = require('../services/chatbotService');

exports.preguntar = async (req, res) => {
  const { mensaje, historial } = req.body || {};

  if (typeof mensaje !== 'string' || !mensaje.trim()) {
    return res.status(400).json({ mensaje: 'El mensaje es obligatorio.' });
  }
  if (mensaje.trim().length > chatbotService.MAX_CHARS) {
    return res.status(400).json({ mensaje: `El mensaje no puede superar ${chatbotService.MAX_CHARS} caracteres.` });
  }

  try {
    const respuesta = await chatbotService.responder(mensaje.trim(), historial);
    res.json({ respuesta });
  } catch (error) {
    console.error('Chatbot:', error.message);
    if (error.status === 503) {
      return res.status(503).json({ mensaje: 'El asistente no está disponible por ahora.' });
    }
    res.status(502).json({ mensaje: 'No se pudo obtener respuesta del asistente. Intenta de nuevo.' });
  }
};
