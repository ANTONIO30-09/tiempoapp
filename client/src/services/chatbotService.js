import api from './api';

export async function preguntar(mensaje, historial = []) {
  const { data } = await api.post(
    '/api/chatbot',
    { mensaje, historial },
    { timeout: 30000 }
  );
  return data.respuesta;
}
