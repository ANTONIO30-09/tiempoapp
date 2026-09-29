import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Publicaciones from './Publicaciones';
import * as publicacionesService from '../services/publicacionesService';

vi.mock('../services/publicacionesService', () => ({
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ usuario: { id: 'aaa-1111', nombre: 'Ana' } }),
}));

const AUTOR_ID = 'aaa-1111';

function pub(overrides = {}) {
  return {
    id: 'pub-1',
    autor_id: AUTOR_ID,
    titulo: 'Clase de cocina',
    descripcion: 'Para principiantes',
    horas_estimadas: 2,
    habilidades: ['cocina'],
    ciudad: 'Cochabamba',
    modalidad: 'presencial',
    activa: true,
    autor: { id: AUTOR_ID, nombre: 'Ana', apellido: 'Pérez', ciudad: 'Cochabamba' },
    ...overrides,
  };
}

function renderizar() {
  return render(
    <MemoryRouter>
      <Publicaciones />
    </MemoryRouter>
  );
}

describe('Publicaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    publicacionesService.listar.mockResolvedValue([]);
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('carga el listado al montar y llama al service sin filtros', async () => {
    publicacionesService.listar.mockResolvedValueOnce([pub()]);

    renderizar();

    await waitFor(() => {
      expect(publicacionesService.listar).toHaveBeenCalledWith({});
    });
    expect(await screen.findByText('Clase de cocina')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay publicaciones', async () => {
    publicacionesService.listar.mockResolvedValueOnce([]);

    renderizar();

    expect(
      await screen.findByText(/no hay publicaciones que coincidan/i)
    ).toBeInTheDocument();
  });

  it('muestra error si el service falla al cargar', async () => {
    publicacionesService.listar.mockRejectedValueOnce(new Error('boom'));

    renderizar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(/no se pudieron cargar las publicaciones/i);
  });

  it('envía los filtros al service al enviar el formulario', async () => {
    publicacionesService.listar.mockResolvedValue([]);

    renderizar();
    await waitFor(() => expect(publicacionesService.listar).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/habilidad/i), 'cocina');
    await userEvent.type(screen.getByLabelText(/^ciudad$/i), 'Cochabamba');
    await userEvent.type(screen.getByLabelText(/buscar en título/i), 'guitarra');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(publicacionesService.listar).toHaveBeenLastCalledWith({
        habilidad: 'cocina',
        ciudad: 'Cochabamba',
        texto: 'guitarra',
      });
    });
  });

  it('"Limpiar" resetea los filtros y recarga sin ellos', async () => {
    publicacionesService.listar.mockResolvedValue([]);

    renderizar();
    await waitFor(() => expect(publicacionesService.listar).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/habilidad/i), 'cocina');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    await waitFor(() =>
      expect(publicacionesService.listar).toHaveBeenLastCalledWith({ habilidad: 'cocina' })
    );

    await userEvent.click(screen.getByRole('button', { name: /limpiar/i }));

    await waitFor(() => {
      expect(publicacionesService.listar).toHaveBeenLastCalledWith({});
    });
  });

  it('abre el formulario en modo creación al pulsar "Nueva publicación"', async () => {
    renderizar();
    await waitFor(() => expect(publicacionesService.listar).toHaveBeenCalled());

    expect(screen.queryByText(/nueva publicación/i, { selector: 'h3' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /nueva publicación/i }));

    expect(screen.getByText(/nueva publicación/i, { selector: 'h3' })).toBeInTheDocument();
  });

  it('abre el formulario en modo edición con la publicación al pulsar Editar', async () => {
    publicacionesService.listar.mockResolvedValueOnce([pub()]);

    renderizar();
    await screen.findByText('Clase de cocina');

    await userEvent.click(screen.getByRole('button', { name: /editar/i }));

    expect(screen.getByText(/editar publicación/i, { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ej: clases de guitarra/i)).toHaveValue('Clase de cocina');
  });

  it('crea una publicación y refresca el listado', async () => {
    publicacionesService.listar.mockResolvedValue([]);
    publicacionesService.crear.mockResolvedValueOnce(pub({ id: 'nueva' }));

    renderizar();
    await waitFor(() => expect(publicacionesService.listar).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: /nueva publicación/i }));
    await userEvent.type(screen.getByPlaceholderText(/ej: clases de guitarra/i), 'Clase de piano');
    await userEvent.type(screen.getByLabelText(/horas estimadas/i), '1');
    await userEvent.click(screen.getByRole('button', { name: /crear publicación/i }));

    await waitFor(() => {
      expect(publicacionesService.crear).toHaveBeenCalled();
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/creada correctamente/i);
    // Refresco: listar se llamó al menos 2 veces
    expect(publicacionesService.listar.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('elimina con confirmación y refresca el listado', async () => {
    publicacionesService.listar.mockResolvedValue([pub()]);
    publicacionesService.eliminar.mockResolvedValueOnce({ mensaje: 'ok' });

    renderizar();
    await screen.findByText('Clase de cocina');

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(publicacionesService.eliminar).toHaveBeenCalledWith('pub-1');
    });
  });

  it('no elimina si el usuario cancela la confirmación', async () => {
    window.confirm = vi.fn().mockReturnValue(false);
    publicacionesService.listar.mockResolvedValue([pub()]);

    renderizar();
    await screen.findByText('Clase de cocina');

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(publicacionesService.eliminar).not.toHaveBeenCalled();
  });

  it('muestra error si eliminar falla', async () => {
    publicacionesService.listar.mockResolvedValue([pub()]);
    publicacionesService.eliminar.mockRejectedValueOnce(new Error('boom'));

    renderizar();
    await screen.findByText('Clase de cocina');

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo eliminar/i);
  });

  it('oculta editar/eliminar en publicaciones ajenas', async () => {
    publicacionesService.listar.mockResolvedValueOnce([
      pub({ id: 'ajena', autor_id: 'otro-id' }),
    ]);

    renderizar();

    await screen.findByText('Clase de cocina');
    const article = screen.getByText('Clase de cocina').closest('article');
    expect(within(article).queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(within(article).queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });
});
