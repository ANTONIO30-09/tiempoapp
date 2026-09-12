const { sequelize, Usuario, Transaccion } = require('../../models');
const creditosController = require('../creditosController');

jest.mock('../../models', () => ({
  sequelize: { transaction: jest.fn() },
  Usuario: { findByPk: jest.fn() },
  Transaccion: { create: jest.fn(), findAll: jest.fn() },
}));

jest.mock('sequelize', () => ({
  Op: { or: Symbol('or') },
}));

function crearRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const EMISOR_ID = 'aaa-1111';
const RECEPTOR_ID = 'zzz-9999';

function mockUsuario(overrides = {}) {
  return {
    id: overrides.id || EMISOR_ID,
    creditos_tiempo: overrides.creditos_tiempo ?? 10,
    save: jest.fn().mockResolvedValue(true),
  };
}

function configurarTransaccion(cb) {
  sequelize.transaction.mockImplementation(async (fn) => {
    const t = { LOCK: { UPDATE: 'UPDATE' }, id: 'TX_FAKE' };
    if (cb) await cb(t);
    return fn(t);
  });
}

describe('creditosController.transferir', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configurarTransaccion();
  });

  it('devuelve 401 si no hay usuario autenticado', async () => {
    const req = { usuario: null, body: { receptor_id: RECEPTOR_ID, horas: 1 } };
    const res = crearRes();

    await creditosController.transferir(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('devuelve 400 si falta receptor_id', async () => {
    const req = { usuario: { id: EMISOR_ID }, body: { horas: 1 } };
    const res = crearRes();

    await creditosController.transferir(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/receptor es obligatorio/i) })
    );
  });

  it('devuelve 400 en auto-transferencia', async () => {
    const req = { usuario: { id: EMISOR_ID }, body: { receptor_id: EMISOR_ID, horas: 1 } };
    const res = crearRes();

    await creditosController.transferir(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/a ti mismo/i) })
    );
  });

  it('devuelve 400 si horas no es un número positivo', async () => {
    const casos = [0, -1, 'abc', null, undefined];
    for (const horas of casos) {
      jest.clearAllMocks();
      configurarTransaccion();
      const req = { usuario: { id: EMISOR_ID }, body: { receptor_id: RECEPTOR_ID, horas } };
      const res = crearRes();
      await creditosController.transferir(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  it('devuelve 404 si el receptor no existe', async () => {
    Usuario.findByPk.mockImplementation((id) => {
      if (id === EMISOR_ID) return Promise.resolve(mockUsuario({ id: EMISOR_ID }));
      return Promise.resolve(null);
    });

    const req = { usuario: { id: EMISOR_ID }, body: { receptor_id: RECEPTOR_ID, horas: 1 } };
    const res = crearRes();

    await creditosController.transferir(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('devuelve 400 si el emisor no tiene saldo suficiente', async () => {
    Usuario.findByPk.mockImplementation((id) => {
      if (id === EMISOR_ID) return Promise.resolve(mockUsuario({ id: EMISOR_ID, creditos_tiempo: 1 }));
      return Promise.resolve(mockUsuario({ id: RECEPTOR_ID, creditos_tiempo: 0 }));
    });

    const req = { usuario: { id: EMISOR_ID }, body: { receptor_id: RECEPTOR_ID, horas: 5 } };
    const res = crearRes();

    await creditosController.transferir(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/saldo insuficiente/i) })
    );
  });

  it('realiza la transferencia correctamente y usa lock de actualización', async () => {
    const emisor = mockUsuario({ id: EMISOR_ID, creditos_tiempo: 10 });
    const receptor = mockUsuario({ id: RECEPTOR_ID, creditos_tiempo: 2 });

    Usuario.findByPk.mockImplementation((id) => {
      if (id === EMISOR_ID) return Promise.resolve(emisor);
      if (id === RECEPTOR_ID) return Promise.resolve(receptor);
      return Promise.resolve(null);
    });

    const transaccionCreada = { id: 'trx-1', horas: 3 };
    Transaccion.create.mockResolvedValueOnce(transaccionCreada);

    const req = {
      usuario: { id: EMISOR_ID },
      body: { receptor_id: RECEPTOR_ID, horas: 3, descripcion: 'Clase de cocina' },
    };
    const res = crearRes();

    await creditosController.transferir(req, res);

    expect(emisor.creditos_tiempo).toBe(7);
    expect(receptor.creditos_tiempo).toBe(5);
    expect(emisor.save).toHaveBeenCalled();
    expect(receptor.save).toHaveBeenCalled();
    expect(Transaccion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        emisor_id: EMISOR_ID,
        receptor_id: RECEPTOR_ID,
        horas: 3,
        descripcion: 'Clase de cocina',
      }),
      expect.objectContaining({ transaction: expect.anything() })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ transaccion: transaccionCreada, saldo: 7 })
    );

    // Lock verificado: findByPk se llamó con lock: 'UPDATE'
    const llamadas = Usuario.findByPk.mock.calls;
    expect(llamadas.length).toBeGreaterThanOrEqual(2);
    for (const [, opciones] of llamadas) {
      expect(opciones).toEqual(expect.objectContaining({ lock: 'UPDATE' }));
    }
  });

  it('hace rollback si el receptor no se puede guardar', async () => {
    const emisor = mockUsuario({ id: EMISOR_ID, creditos_tiempo: 10 });
    const receptor = mockUsuario({ id: RECEPTOR_ID, creditos_tiempo: 2 });
    receptor.save.mockRejectedValueOnce(new Error('Fallo simulado de BD'));

    Usuario.findByPk.mockImplementation((id) => {
      if (id === EMISOR_ID) return Promise.resolve(emisor);
      if (id === RECEPTOR_ID) return Promise.resolve(receptor);
      return Promise.resolve(null);
    });

    const req = {
      usuario: { id: EMISOR_ID },
      body: { receptor_id: RECEPTOR_ID, horas: 3 },
    };
    const res = crearRes();

    await creditosController.transferir(req, res);

    // No se crea la transacción porque el fallo ocurre antes
    expect(Transaccion.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('creditosController.historial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 401 si no hay usuario autenticado', async () => {
    const req = { usuario: null };
    const res = crearRes();

    await creditosController.historial(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('devuelve el historial del usuario autenticado', async () => {
    const filas = [{ id: 'trx-1' }, { id: 'trx-2' }];
    Transaccion.findAll.mockResolvedValueOnce(filas);

    const req = { usuario: { id: EMISOR_ID } };
    const res = crearRes();

    await creditosController.historial(req, res);

    expect(Transaccion.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(filas);
  });
});

describe('creditosController.saldo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 401 si no hay usuario autenticado', async () => {
    const req = { usuario: null };
    const res = crearRes();

    await creditosController.saldo(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('devuelve 404 si el usuario no existe', async () => {
    Usuario.findByPk.mockResolvedValueOnce(null);

    const req = { usuario: { id: EMISOR_ID } };
    const res = crearRes();

    await creditosController.saldo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('devuelve el saldo del usuario autenticado', async () => {
    Usuario.findByPk.mockResolvedValueOnce({ id: EMISOR_ID, creditos_tiempo: 4.5 });

    const req = { usuario: { id: EMISOR_ID } };
    const res = crearRes();

    await creditosController.saldo(req, res);

    expect(res.json).toHaveBeenCalledWith({ creditos_tiempo: 4.5 });
  });
});
