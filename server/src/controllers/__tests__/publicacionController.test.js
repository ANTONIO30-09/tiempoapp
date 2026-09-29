const { Op } = require('sequelize');
const { Publicacion } = require('../../models');
const publicacionController = require('../publicacionController');

jest.mock('../../models', () => ({
  Usuario: {},
  Publicacion: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('sequelize', () => ({
  Op: {
    contains: Symbol('contains'),
    iLike: Symbol('iLike'),
  },
}));

function crearRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const AUTOR_ID = 'aaa-1111';
const OTRO_ID = 'zzz-9999';
const PUBLICACION_ID = 'pub-0001';

function mockPublicacion(overrides = {}) {
  return {
    id: overrides.id || PUBLICACION_ID,
    autor_id: overrides.autor_id || AUTOR_ID,
    titulo: overrides.titulo || 'Clase de cocina',
    descripcion: overrides.descripcion ?? null,
    horas_estimadas: overrides.horas_estimadas ?? 2,
    habilidades: overrides.habilidades || ['cocina'],
    ciudad: overrides.ciudad || 'Cochabamba',
    modalidad: overrides.modalidad || 'presencial',
    activa: overrides.activa ?? true,
    save: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
  };
}

describe('publicacionController.crear', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 401 si no hay usuario autenticado', async () => {
    const req = { usuario: null, body: { titulo: 'X', horas_estimadas: 1 } };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/no autenticado/i) })
    );
  });

  it('devuelve 400 si falta el título', async () => {
    const req = { usuario: { id: AUTOR_ID }, body: { horas_estimadas: 2 } };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/título es obligatorio/i) })
    );
  });

  it('devuelve 400 si el título es solo espacios', async () => {
    const req = { usuario: { id: AUTOR_ID }, body: { titulo: '   ', horas_estimadas: 2 } };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('devuelve 400 si horas_estimadas no es un número positivo', async () => {
    const casos = [0, -1, 'abc', null, undefined];
    for (const horas of casos) {
      jest.clearAllMocks();
      const req = {
        usuario: { id: AUTOR_ID },
        body: { titulo: 'Clase', horas_estimadas: horas },
      };
      const res = crearRes();
      await publicacionController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  it('devuelve 400 si la modalidad no es válida', async () => {
    const req = {
      usuario: { id: AUTOR_ID },
      body: { titulo: 'Clase', horas_estimadas: 2, modalidad: 'telepática' },
    };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/modalidad inválida/i) })
    );
  });

  it('crea la publicación con valores por defecto', async () => {
    const creada = mockPublicacion({ titulo: 'Clase de cocina' });
    Publicacion.create.mockResolvedValueOnce(creada);

    const req = {
      usuario: { id: AUTOR_ID },
      body: { titulo: '  Clase de cocina  ', horas_estimadas: '3' },
    };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(Publicacion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autor_id: AUTOR_ID,
        titulo: 'Clase de cocina',
        horas_estimadas: 3,
        habilidades: [],
        ciudad: 'Cochabamba',
        modalidad: 'presencial',
        descripcion: null,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(creada);
  });

  it('crea la publicación con todos los campos explícitos', async () => {
    const creada = mockPublicacion({ modalidad: 'ambas', ciudad: 'La Paz' });
    Publicacion.create.mockResolvedValueOnce(creada);

    const req = {
      usuario: { id: AUTOR_ID },
      body: {
        titulo: 'Clase de guitarra',
        descripcion: 'Clases para principiantes',
        horas_estimadas: 1.5,
        habilidades: ['guitarra', 'música'],
        ciudad: 'La Paz',
        modalidad: 'ambas',
      },
    };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(Publicacion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Clase de guitarra',
        descripcion: 'Clases para principiantes',
        horas_estimadas: 1.5,
        habilidades: ['guitarra', 'música'],
        ciudad: 'La Paz',
        modalidad: 'ambas',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('devuelve 500 si Publicacion.create lanza', async () => {
    Publicacion.create.mockRejectedValueOnce(new Error('Fallo simulado de BD'));

    const req = {
      usuario: { id: AUTOR_ID },
      body: { titulo: 'Clase', horas_estimadas: 1 },
    };
    const res = crearRes();

    await publicacionController.crear(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/error al crear la publicación/i) })
    );
  });
});

describe('publicacionController.listar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista solo publicaciones activas cuando no hay filtros', async () => {
    Publicacion.findAll.mockResolvedValueOnce([]);

    const req = { query: {} };
    const res = crearRes();

    await publicacionController.listar(req, res);

    expect(Publicacion.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { activa: true },
      })
    );
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('aplica filtro por habilidad con Op.contains', async () => {
    Publicacion.findAll.mockResolvedValueOnce([]);

    const req = { query: { habilidad: 'cocina' } };
    const res = crearRes();

    await publicacionController.listar(req, res);

    const args = Publicacion.findAll.mock.calls[0][0];
    expect(args.where).toEqual({
      activa: true,
      habilidades: { [Op.contains]: ['cocina'] },
    });
  });

  it('aplica filtro por ciudad con Op.iLike', async () => {
    Publicacion.findAll.mockResolvedValueOnce([]);

    const req = { query: { ciudad: 'Cochabamba' } };
    const res = crearRes();

    await publicacionController.listar(req, res);

    const args = Publicacion.findAll.mock.calls[0][0];
    expect(args.where).toEqual({
      activa: true,
      ciudad: { [Op.iLike]: 'Cochabamba' },
    });
  });

  it('aplica filtro por texto en título con comodines', async () => {
    Publicacion.findAll.mockResolvedValueOnce([]);

    const req = { query: { texto: 'guitarra' } };
    const res = crearRes();

    await publicacionController.listar(req, res);

    const args = Publicacion.findAll.mock.calls[0][0];
    expect(args.where).toEqual({
      activa: true,
      titulo: { [Op.iLike]: '%guitarra%' },
    });
  });

  it('combina los tres filtros cuando vienen juntos', async () => {
    Publicacion.findAll.mockResolvedValueOnce([]);

    const req = { query: { habilidad: 'cocina', ciudad: 'La Paz', texto: 'clase' } };
    const res = crearRes();

    await publicacionController.listar(req, res);

    const args = Publicacion.findAll.mock.calls[0][0];
    expect(args.where).toEqual({
      activa: true,
      habilidades: { [Op.contains]: ['cocina'] },
      ciudad: { [Op.iLike]: 'La Paz' },
      titulo: { [Op.iLike]: '%clase%' },
    });
  });

  it('devuelve 500 si Publicacion.findAll lanza', async () => {
    Publicacion.findAll.mockRejectedValueOnce(new Error('Fallo simulado de BD'));

    const req = { query: {} };
    const res = crearRes();

    await publicacionController.listar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/error al listar publicaciones/i) })
    );
  });
});

describe('publicacionController.obtenerPorId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 404 si la publicación no existe', async () => {
    Publicacion.findByPk.mockResolvedValueOnce(null);

    const req = { params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.obtenerPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/no encontrada/i) })
    );
  });

  it('devuelve la publicación con el autor incluido', async () => {
    const pub = mockPublicacion();
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = { params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.obtenerPorId(req, res);

    expect(Publicacion.findByPk).toHaveBeenCalledWith(
      PUBLICACION_ID,
      expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'autor' }),
        ]),
      })
    );
    expect(res.json).toHaveBeenCalledWith(pub);
  });

  it('devuelve 500 si findByPk lanza', async () => {
    Publicacion.findByPk.mockRejectedValueOnce(new Error('Fallo simulado de BD'));

    const req = { params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.obtenerPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicacionController.actualizar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 404 si la publicación no existe', async () => {
    Publicacion.findByPk.mockResolvedValueOnce(null);

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: { titulo: 'Nuevo' },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('devuelve 403 si el usuario no es el autor', async () => {
    Publicacion.findByPk.mockResolvedValueOnce(mockPublicacion({ autor_id: AUTOR_ID }));

    const req = {
      usuario: { id: OTRO_ID },
      params: { id: PUBLICACION_ID },
      body: { titulo: 'Nuevo' },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/no tienes permiso/i) })
    );
  });

  it('devuelve 400 si el título queda vacío', async () => {
    Publicacion.findByPk.mockResolvedValueOnce(mockPublicacion({ autor_id: AUTOR_ID }));

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: { titulo: '   ' },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('devuelve 400 si horas_estimadas es inválido', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: { horas_estimadas: -5 },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pub.save).not.toHaveBeenCalled();
  });

  it('devuelve 400 si la modalidad es inválida', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: { modalidad: 'invisible' },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pub.save).not.toHaveBeenCalled();
  });

  it('actualiza los campos enviados y guarda', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID, titulo: 'Viejo' });
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: {
        titulo: '  Nuevo título  ',
        descripcion: 'Descripción nueva',
        horas_estimadas: '4',
        habilidades: ['piano'],
        ciudad: 'Santa Cruz',
        modalidad: 'remota',
      },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(pub.titulo).toBe('Nuevo título');
    expect(pub.descripcion).toBe('Descripción nueva');
    expect(pub.horas_estimadas).toBe(4);
    expect(pub.habilidades).toEqual(['piano']);
    expect(pub.ciudad).toBe('Santa Cruz');
    expect(pub.modalidad).toBe('remota');
    expect(pub.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(pub);
  });

  it('permite desactivar la publicación con activa=false', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID, activa: true });
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: { activa: false },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(pub.activa).toBe(false);
    expect(pub.save).toHaveBeenCalled();
  });

  it('devuelve 500 si save lanza', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    pub.save.mockRejectedValueOnce(new Error('Fallo simulado de BD'));
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = {
      usuario: { id: AUTOR_ID },
      params: { id: PUBLICACION_ID },
      body: { titulo: 'Nuevo' },
    };
    const res = crearRes();

    await publicacionController.actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicacionController.eliminar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 404 si la publicación no existe', async () => {
    Publicacion.findByPk.mockResolvedValueOnce(null);

    const req = { usuario: { id: AUTOR_ID }, params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('devuelve 403 si el usuario no es el autor', async () => {
    Publicacion.findByPk.mockResolvedValueOnce(mockPublicacion({ autor_id: AUTOR_ID }));

    const req = { usuario: { id: OTRO_ID }, params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/no tienes permiso/i) })
    );
  });

  it('elimina la publicación del autor (borrado real con destroy)', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = { usuario: { id: AUTOR_ID }, params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.eliminar(req, res);

    expect(pub.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringMatching(/eliminada correctamente/i) })
    );
  });

  it('devuelve 500 si destroy lanza', async () => {
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    pub.destroy.mockRejectedValueOnce(new Error('Fallo simulado de BD'));
    Publicacion.findByPk.mockResolvedValueOnce(pub);

    const req = { usuario: { id: AUTOR_ID }, params: { id: PUBLICACION_ID } };
    const res = crearRes();

    await publicacionController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
