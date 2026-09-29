import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import * as publicacionesService from './publicacionesService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('publicacionesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('hace GET a /api/publicaciones y devuelve data', async () => {
      const filas = [{ id: 'p1' }, { id: 'p2' }];
      api.get.mockResolvedValueOnce({ data: filas });

      const resultado = await publicacionesService.listar();

      expect(api.get).toHaveBeenCalledWith('/api/publicaciones', { params: {} });
      expect(resultado).toEqual(filas);
    });

    it('pasa los filtros como params', async () => {
      api.get.mockResolvedValueOnce({ data: [] });

      await publicacionesService.listar({ habilidad: 'cocina', ciudad: 'Cochabamba' });

      expect(api.get).toHaveBeenCalledWith('/api/publicaciones', {
        params: { habilidad: 'cocina', ciudad: 'Cochabamba' },
      });
    });

    it('propaga el error si la petición falla', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValueOnce(error);

      await expect(publicacionesService.listar()).rejects.toThrow('Network error');
    });
  });

  describe('obtener', () => {
    it('hace GET a /api/publicaciones/:id y devuelve data', async () => {
      const pub = { id: 'p1', titulo: 'Clase' };
      api.get.mockResolvedValueOnce({ data: pub });

      const resultado = await publicacionesService.obtener('p1');

      expect(api.get).toHaveBeenCalledWith('/api/publicaciones/p1');
      expect(resultado).toEqual(pub);
    });

    it('propaga el error si no existe', async () => {
      const error = new Error('Not found');
      api.get.mockRejectedValueOnce(error);

      await expect(publicacionesService.obtener('x')).rejects.toThrow('Not found');
    });
  });

  describe('crear', () => {
    it('hace POST a /api/publicaciones con los datos', async () => {
      const datos = { titulo: 'Clase de cocina', horas_estimadas: 2 };
      const creada = { id: 'p1', ...datos };
      api.post.mockResolvedValueOnce({ data: creada });

      const resultado = await publicacionesService.crear(datos);

      expect(api.post).toHaveBeenCalledWith('/api/publicaciones', datos);
      expect(resultado).toEqual(creada);
    });

    it('propaga el error 400 del backend', async () => {
      const error = new Error('Bad request');
      api.post.mockRejectedValueOnce(error);

      await expect(publicacionesService.crear({})).rejects.toThrow('Bad request');
    });
  });

  describe('actualizar', () => {
    it('hace PUT a /api/publicaciones/:id con los datos', async () => {
      const datos = { titulo: 'Nuevo título' };
      const actualizada = { id: 'p1', ...datos };
      api.put.mockResolvedValueOnce({ data: actualizada });

      const resultado = await publicacionesService.actualizar('p1', datos);

      expect(api.put).toHaveBeenCalledWith('/api/publicaciones/p1', datos);
      expect(resultado).toEqual(actualizada);
    });

    it('propaga el error 403 si no es el autor', async () => {
      const error = new Error('Forbidden');
      api.put.mockRejectedValueOnce(error);

      await expect(publicacionesService.actualizar('p1', {})).rejects.toThrow('Forbidden');
    });
  });

  describe('eliminar', () => {
    it('hace DELETE a /api/publicaciones/:id y devuelve la respuesta', async () => {
      const respuesta = { mensaje: 'Publicación eliminada correctamente.' };
      api.delete.mockResolvedValueOnce({ data: respuesta });

      const resultado = await publicacionesService.eliminar('p1');

      expect(api.delete).toHaveBeenCalledWith('/api/publicaciones/p1');
      expect(resultado).toEqual(respuesta);
    });

    it('propaga el error 404 si no existe', async () => {
      const error = new Error('Not found');
      api.delete.mockRejectedValueOnce(error);

      await expect(publicacionesService.eliminar('x')).rejects.toThrow('Not found');
    });
  });
});
