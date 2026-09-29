import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TarjetaPublicacion from './TarjetaPublicacion';

const AUTOR_ID = 'aaa-1111';
const OTRO_ID = 'zzz-9999';

function mockPublicacion(overrides = {}) {
  return {
    id: 'pub-1',
    autor_id: AUTOR_ID,
    titulo: 'Clase de cocina',
    descripcion: 'Clases para principiantes',
    horas_estimadas: 2,
    habilidades: ['cocina', 'repostería'],
    ciudad: 'Cochabamba',
    modalidad: 'presencial',
    activa: true,
    autor: { id: AUTOR_ID, nombre: 'Ana', apellido: 'Pérez', ciudad: 'Cochabamba' },
    ...overrides,
  };
}

describe('TarjetaPublicacion', () => {
  it('renderiza título, descripción, horas, ciudad y habilidades', () => {
    render(<TarjetaPublicacion publicacion={mockPublicacion()} usuarioActual={null} />);

    expect(screen.getByText('Clase de cocina')).toBeInTheDocument();
    expect(screen.getByText('Clases para principiantes')).toBeInTheDocument();
    expect(screen.getByText(/2 h estimadas/)).toBeInTheDocument();
    expect(screen.getAllByText('Cochabamba').length).toBeGreaterThan(0);
    expect(screen.getByText('cocina')).toBeInTheDocument();
    expect(screen.getByText('repostería')).toBeInTheDocument();
  });

  it('muestra el nombre del autor cuando viene en el include', () => {
    render(<TarjetaPublicacion publicacion={mockPublicacion()} usuarioActual={null} />);

    expect(screen.getByText(/Ana Pérez/)).toBeInTheDocument();
  });

  it('muestra la modalidad con etiqueta legible', () => {
    render(
      <TarjetaPublicacion
        publicacion={mockPublicacion({ modalidad: 'ambas' })}
        usuarioActual={null}
      />
    );

    expect(screen.getByText('Presencial o remota')).toBeInTheDocument();
  });

  it('muestra el badge Inactiva cuando activa=false', () => {
    render(
      <TarjetaPublicacion
        publicacion={mockPublicacion({ activa: false })}
        usuarioActual={null}
      />
    );

    expect(screen.getByText('Inactiva')).toBeInTheDocument();
  });

  it('NO muestra botones editar/eliminar si el usuario no es el autor', () => {
    render(
      <TarjetaPublicacion
        publicacion={mockPublicacion({ autor_id: AUTOR_ID })}
        usuarioActual={{ id: OTRO_ID }}
      />
    );

    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('NO muestra botones si no hay usuario autenticado', () => {
    render(<TarjetaPublicacion publicacion={mockPublicacion()} usuarioActual={null} />);

    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('SÍ muestra botones si el usuario es el autor', () => {
    render(
      <TarjetaPublicacion
        publicacion={mockPublicacion({ autor_id: AUTOR_ID })}
        usuarioActual={{ id: AUTOR_ID }}
      />
    );

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('compara autor_id y usuario.id como strings (UUID numérico/alfanumérico)', () => {
    render(
      <TarjetaPublicacion
        publicacion={mockPublicacion({ autor_id: '123' })}
        usuarioActual={{ id: 123 }}
      />
    );

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
  });

  it('llama onEditar con la publicación al hacer click', async () => {
    const onEditar = vi.fn();
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    render(
      <TarjetaPublicacion
        publicacion={pub}
        usuarioActual={{ id: AUTOR_ID }}
        onEditar={onEditar}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /editar/i }));

    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledWith(pub);
  });

  it('llama onEliminar con la publicación al hacer click', async () => {
    const onEliminar = vi.fn();
    const pub = mockPublicacion({ autor_id: AUTOR_ID });
    render(
      <TarjetaPublicacion
        publicacion={pub}
        usuarioActual={{ id: AUTOR_ID }}
        onEliminar={onEliminar}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onEliminar).toHaveBeenCalledTimes(1);
    expect(onEliminar).toHaveBeenCalledWith(pub);
  });

  it('no rompe si onEditar/onEliminar no se pasan', async () => {
    render(
      <TarjetaPublicacion
        publicacion={mockPublicacion({ autor_id: AUTOR_ID })}
        usuarioActual={{ id: AUTOR_ID }}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /editar/i }));
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    // Sin expectativa: el test pasa si no arroja
  });

  it('devuelve null si no hay publicación', () => {
    const { container } = render(<TarjetaPublicacion publicacion={null} usuarioActual={null} />);
    expect(container.firstChild).toBeNull();
  });
});
