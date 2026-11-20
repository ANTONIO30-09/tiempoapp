const { limitarPorUsuario } = require('../rateLimit');

function crearRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('limitarPorUsuario', () => {
  afterEach(() => jest.restoreAllMocks());

  test('bloquea con 429 al superar el máximo', () => {
    const limitar = limitarPorUsuario({ max: 2, ventanaMs: 1000 });
    const next = jest.fn();
    const req = { usuario: { id: 'u1' } };
    limitar(req, crearRes(), next);
    limitar(req, crearRes(), next);
    const res = crearRes();
    limitar(req, res, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  test('el límite es por usuario', () => {
    const limitar = limitarPorUsuario({ max: 1, ventanaMs: 1000 });
    const next = jest.fn();
    limitar({ usuario: { id: 'u1' } }, crearRes(), next);
    limitar({ usuario: { id: 'u2' } }, crearRes(), next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  test('se reinicia al terminar la ventana', () => {
    const limitar = limitarPorUsuario({ max: 1, ventanaMs: 1000 });
    const next = jest.fn();
    const req = { usuario: { id: 'u1' } };
    const spy = jest.spyOn(Date, 'now');
    spy.mockReturnValue(1000);
    limitar(req, crearRes(), next);
    spy.mockReturnValue(2500);
    limitar(req, crearRes(), next);
    expect(next).toHaveBeenCalledTimes(2);
  });
});
