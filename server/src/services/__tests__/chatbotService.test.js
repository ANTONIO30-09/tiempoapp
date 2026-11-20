const { responder, sanitizarHistorial } = require('../chatbotService');

function respuestaOk(texto) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: texto } }] }) };
}

describe('chatbotService', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key';
    delete process.env.GROQ_MODEL;
    global.fetch = jest.fn();
  });

  test('devuelve el texto de la respuesta', async () => {
    global.fetch.mockResolvedValue(respuestaOk('  Hola  '));
    await expect(responder('hola')).resolves.toBe('Hola');
  });

  test('envía system, historial saneado y mensaje con la key en el header', async () => {
    global.fetch.mockResolvedValue(respuestaOk('ok'));
    await responder('pregunta', [
      { role: 'user', content: 'a' },
      { role: 'system', content: 'malicioso' },
      { role: 'assistant', content: 'b' },
    ]);
    const [url, opciones] = global.fetch.mock.calls[0];
    const body = JSON.parse(opciones.body);
    expect(url).toContain('api.groq.com');
    expect(opciones.headers.Authorization).toBe('Bearer test-key');
    expect(body.model).toBe('openai/gpt-oss-20b');
    expect(body.messages[0].role).toBe('system');
    expect(body.messages.map((m) => m.content)).not.toContain('malicioso');
    expect(body.messages[body.messages.length - 1]).toEqual({ role: 'user', content: 'pregunta' });
  });

  test('usa GROQ_MODEL si está definido', async () => {
    process.env.GROQ_MODEL = 'otro-modelo';
    global.fetch.mockResolvedValue(respuestaOk('ok'));
    await responder('x');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).model).toBe('otro-modelo');
  });

  test('sin API key lanza 503 y no llama a fetch', async () => {
    delete process.env.GROQ_API_KEY;
    await expect(responder('x')).rejects.toMatchObject({ status: 503 });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('error HTTP del proveedor lanza 502', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 429 });
    await expect(responder('x')).rejects.toMatchObject({ status: 502 });
  });

  test('respuesta vacía lanza 502', async () => {
    global.fetch.mockResolvedValue(respuestaOk('   '));
    await expect(responder('x')).rejects.toMatchObject({ status: 502 });
  });

  test('fallo de red lanza 502', async () => {
    global.fetch.mockRejectedValue(new Error('red'));
    await expect(responder('x')).rejects.toMatchObject({ status: 502 });
  });

  test('sanitizarHistorial limita a 10, recorta y descarta inválidos', () => {
    const largo = Array.from({ length: 15 }, (_, i) => ({ role: 'user', content: `m${i}` }));
    expect(sanitizarHistorial(largo)).toHaveLength(10);
    expect(sanitizarHistorial('nada')).toEqual([]);
    expect(sanitizarHistorial([{ role: 'user', content: 'x'.repeat(900) }])[0].content).toHaveLength(500);
    expect(sanitizarHistorial([{ role: 'user', content: '  ' }, null, { role: 'user', content: 5 }])).toEqual([]);
  });
});
