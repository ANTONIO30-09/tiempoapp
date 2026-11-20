jest.mock('../../services/chatbotService', () => ({
  responder: jest.fn(),
  MAX_CHARS: 500,
}));

const chatbotService = require('../../services/chatbotService');
const { preguntar } = require('../chatbotController');

function crearRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('chatbotController.preguntar', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockRestore();
  });

  test('400 si falta el mensaje', async () => {
    const res = crearRes();
    await preguntar({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 si el mensaje no es string o está vacío', async () => {
    const res = crearRes();
    await preguntar({ body: { mensaje: '   ' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const res2 = crearRes();
    await preguntar({ body: { mensaje: { x: 1 } } }, res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  test('400 si supera el máximo de caracteres', async () => {
    const res = crearRes();
    await preguntar({ body: { mensaje: 'a'.repeat(501) } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(chatbotService.responder).not.toHaveBeenCalled();
  });

  test('200 con la respuesta del servicio', async () => {
    chatbotService.responder.mockResolvedValue('Hola');
    const res = crearRes();
    await preguntar({ body: { mensaje: ' hola ', historial: [] } }, res);
    expect(chatbotService.responder).toHaveBeenCalledWith('hola', []);
    expect(res.json).toHaveBeenCalledWith({ respuesta: 'Hola' });
  });

  test('503 si el servicio no está configurado', async () => {
    chatbotService.responder.mockRejectedValue(Object.assign(new Error('x'), { status: 503 }));
    const res = crearRes();
    await preguntar({ body: { mensaje: 'hola' } }, res);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('502 ante cualquier otro fallo, sin filtrar detalles', async () => {
    chatbotService.responder.mockRejectedValue(new Error('detalle interno secreto'));
    const res = crearRes();
    await preguntar({ body: { mensaje: 'hola' } }, res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('secreto');
  });
});
