const bcrypt = require('bcryptjs');
const { Usuario } = require('../../models');
const usuarioController = require('../usuarioController');

jest.mock('../../models', () => ({
  Usuario: { findByPk: jest.fn() },
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

function crearRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('usuarioController.actualizar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 403 si el id del token no coincide con el id de la URL', async () => {
    const req = {
      params: { id: 'uuid-victima' },
      usuario: { id: 'uuid-atacante' },
      body: { nombre: 'Intruso' },
    };
    const res = crearRes();

    await usuarioController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/no autorizado/i) })
    );
    expect(Usuario.findByPk).not.toHaveBeenCalled();
  });

  it('actualiza el usuario si el id del token coincide con el de la URL', async () => {
    const usuarioFalso = {
      id: 'uuid-a',
      nombre: 'Viejo',
      apellido: 'Perez',
      email: 'viejo@test.com',
      habilidades: [],
      descripcion: '',
      avatar_url: null,
      password_hash: 'hash-viejo',
      save: jest.fn().mockResolvedValue(true),
      toJSON() {
        return { ...this };
      },
    };
    Usuario.findByPk.mockResolvedValueOnce(usuarioFalso);

    const req = {
      params: { id: 'uuid-a' },
      usuario: { id: 'uuid-a' },
      body: { nombre: 'Nuevo', descripcion: 'Actualizado' },
    };
    const res = crearRes();

    await usuarioController.actualizar(req, res);

    expect(usuarioFalso.nombre).toBe('Nuevo');
    expect(usuarioFalso.descripcion).toBe('Actualizado');
    expect(usuarioFalso.save).toHaveBeenCalled();
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta).not.toHaveProperty('password_hash');
  });

  it('devuelve 404 si el usuario no existe', async () => {
    Usuario.findByPk.mockResolvedValueOnce(null);

    const req = {
      params: { id: 'uuid-a' },
      usuario: { id: 'uuid-a' },
      body: {},
    };
    const res = crearRes();

    await usuarioController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('hashea la nueva contraseña cuando se envía password', async () => {
    const usuarioFalso = {
      id: 'uuid-a',
      nombre: 'Ana',
      apellido: 'Perez',
      email: 'ana@test.com',
      habilidades: [],
      descripcion: '',
      avatar_url: null,
      password_hash: 'hash-viejo',
      save: jest.fn().mockResolvedValue(true),
      toJSON() {
        return { ...this };
      },
    };
    Usuario.findByPk.mockResolvedValueOnce(usuarioFalso);
    bcrypt.genSalt.mockResolvedValueOnce('salt');
    bcrypt.hash.mockResolvedValueOnce('hash-nuevo');

    const req = {
      params: { id: 'uuid-a' },
      usuario: { id: 'uuid-a' },
      body: { password: 'nuevaClave' },
    };
    const res = crearRes();

    await usuarioController.actualizar(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('nuevaClave', 'salt');
    expect(usuarioFalso.password_hash).toBe('hash-nuevo');
  });
});

describe('usuarioController.eliminar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 403 si el id del token no coincide con el id de la URL', async () => {
    const req = { params: { id: 'uuid-victima' }, usuario: { id: 'uuid-atacante' } };
    const res = crearRes();

    await usuarioController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Usuario.findByPk).not.toHaveBeenCalled();
  });

  it('elimina el usuario si el id coincide', async () => {
    const usuarioFalso = { id: 'uuid-a', destroy: jest.fn().mockResolvedValue(true) };
    Usuario.findByPk.mockResolvedValueOnce(usuarioFalso);

    const req = { params: { id: 'uuid-a' }, usuario: { id: 'uuid-a' } };
    const res = crearRes();

    await usuarioController.eliminar(req, res);

    expect(usuarioFalso.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/eliminado/i) })
    );
  });

  it('devuelve 404 si el usuario no existe', async () => {
    Usuario.findByPk.mockResolvedValueOnce(null);

    const req = { params: { id: 'uuid-a' }, usuario: { id: 'uuid-a' } };
    const res = crearRes();

    await usuarioController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
