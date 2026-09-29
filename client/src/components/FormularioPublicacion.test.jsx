import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioPublicacion from './FormularioPublicacion';
import * as publicacionesService from '../services/publicacionesService';

vi.mock('../services/publicacionesService', () => ({
  crear: vi.fn(),
  actualizar: vi.fn(),
}));

const PUBLICACION_BASE = {
  id: 'pub-1',
  autor_id: 'aaa-1111',
  titulo: 'Clase de cocina',
  descripcion: 'Clases para principiantes',
  horas_estimadas: 2,
  habilidades: ['cocina', 'repostería'],
  ciudad: 'Cochabamba',
  modalidad: 'presencial',
  activa: true,
};

describe('FormularioPublicacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('modo creación (sin publicacionInicial)', () => {
    it('renderiza el título "Nueva publicación" y los campos vacíos', () => {
      render(<FormularioPublicacion onExito={vi.fn()} onCancelar={vi.fn()} />);

      expect(screen.getByText('Nueva publicación')).toBeInTheDocument();
      expect(screen.getByLabelText(/título/i)).toHaveValue('');
      expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Cochabamba');
      expect(screen.getByLabelText(/modalidad/i)).toHaveValue('presencial');
      // No aparece el checkbox de activa en creación
      expect(screen.queryByLabelText(/publicación activa/i)).not.toBeInTheDocument();
    });

    it('muestra error si falta el título', async () => {
      render(<FormularioPublicacion onExito={vi.fn()} onCancelar={vi.fn()} />);

      await userEvent.click(screen.getByRole('button', { name: /crear publicación/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/título es obligatorio/i);
      expect(publicacionesService.crear).not.toHaveBeenCalled();
    });

    it('muestra error si horas_estimadas no es positivo', async () => {
      render(<FormularioPublicacion onExito={vi.fn()} onCancelar={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/título/i), 'Clase');
      await userEvent.type(screen.getByLabelText(/horas estimadas/i), '0');
      await userEvent.click(screen.getByRole('button', { name: /crear publicación/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/horas estimadas/i);
      expect(publicacionesService.crear).not.toHaveBeenCalled();
    });

    it('crea la publicación con los datos correctos y llama onExito', async () => {
      const creada = { id: 'pub-1', titulo: 'Clase de guitarra' };
      publicacionesService.crear.mockResolvedValueOnce(creada);
      const onExito = vi.fn();

      render(<FormularioPublicacion onExito={onExito} onCancelar={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/título/i), '  Clase de guitarra  ');
      await userEvent.type(screen.getByLabelText(/descripción/i), 'Para principiantes');
      await userEvent.type(screen.getByLabelText(/horas estimadas/i), '1.5');
      await userEvent.type(screen.getByLabelText(/habilidades/i), 'guitarra, música ,  ');
      await userEvent.clear(screen.getByLabelText(/ciudad/i));
      await userEvent.type(screen.getByLabelText(/ciudad/i), 'La Paz');
      await userEvent.selectOptions(screen.getByLabelText(/modalidad/i), 'ambas');

      await userEvent.click(screen.getByRole('button', { name: /crear publicación/i }));

      await waitFor(() => {
        expect(publicacionesService.crear).toHaveBeenCalledWith({
          titulo: 'Clase de guitarra',
          descripcion: 'Para principiantes',
          horas_estimadas: 1.5,
          habilidades: ['guitarra', 'música'],
          ciudad: 'La Paz',
          modalidad: 'ambas',
        });
      });
      expect(onExito).toHaveBeenCalledWith(creada);
    });

    it('muestra el mensaje del backend si crear falla', async () => {
      publicacionesService.crear.mockRejectedValueOnce({
        response: { data: { mensaje: 'Error del servidor de prueba.' } },
      });

      render(<FormularioPublicacion onExito={vi.fn()} onCancelar={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/título/i), 'X');
      await userEvent.type(screen.getByLabelText(/horas estimadas/i), '1');
      await userEvent.click(screen.getByRole('button', { name: /crear publicación/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Error del servidor de prueba.');
      });
    });

    it('llama onCancelar al hacer click en Cancelar', async () => {
      const onCancelar = vi.fn();
      render(<FormularioPublicacion onExito={vi.fn()} onCancelar={onCancelar} />);

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(onCancelar).toHaveBeenCalledTimes(1);
    });
  });

  describe('modo edición (con publicacionInicial)', () => {
    it('precarga los campos y muestra el título "Editar publicación"', () => {
      render(
        <FormularioPublicacion
          publicacionInicial={PUBLICACION_BASE}
          onExito={vi.fn()}
          onCancelar={vi.fn()}
        />
      );

      expect(screen.getByText('Editar publicación')).toBeInTheDocument();
      expect(screen.getByLabelText(/título/i)).toHaveValue('Clase de cocina');
      expect(screen.getByLabelText(/descripción/i)).toHaveValue('Clases para principiantes');
      expect(screen.getByLabelText(/horas estimadas/i)).toHaveValue(2);
      expect(screen.getByLabelText(/habilidades/i)).toHaveValue('cocina, repostería');
      expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Cochabamba');
      expect(screen.getByLabelText(/modalidad/i)).toHaveValue('presencial');
      expect(screen.getByLabelText(/publicación activa/i)).toBeChecked();
    });

    it('actualiza la publicación con los campos modificados y llama onExito', async () => {
      const actualizada = { ...PUBLICACION_BASE, titulo: 'Nuevo título' };
      publicacionesService.actualizar.mockResolvedValueOnce(actualizada);
      const onExito = vi.fn();

      render(
        <FormularioPublicacion
          publicacionInicial={PUBLICACION_BASE}
          onExito={onExito}
          onCancelar={vi.fn()}
        />
      );

      await userEvent.clear(screen.getByLabelText(/título/i));
      await userEvent.type(screen.getByLabelText(/título/i), 'Nuevo título');
      await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

      await waitFor(() => {
        expect(publicacionesService.actualizar).toHaveBeenCalledWith(
          'pub-1',
          expect.objectContaining({
            titulo: 'Nuevo título',
            horas_estimadas: 2,
            habilidades: ['cocina', 'repostería'],
            ciudad: 'Cochabamba',
            modalidad: 'presencial',
            activa: true,
          })
        );
      });
      expect(onExito).toHaveBeenCalledWith(actualizada);
    });

    it('permite desmarcar "publicación activa" y envía activa=false', async () => {
      publicacionesService.actualizar.mockResolvedValueOnce({ ...PUBLICACION_BASE, activa: false });

      render(
        <FormularioPublicacion
          publicacionInicial={PUBLICACION_BASE}
          onExito={vi.fn()}
          onCancelar={vi.fn()}
        />
      );

      await userEvent.click(screen.getByLabelText(/publicación activa/i));
      await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

      await waitFor(() => {
        expect(publicacionesService.actualizar).toHaveBeenCalledWith(
          'pub-1',
          expect.objectContaining({ activa: false })
        );
      });
    });

    it('no llama a crear en modo edición', async () => {
      publicacionesService.actualizar.mockResolvedValueOnce(PUBLICACION_BASE);

      render(
        <FormularioPublicacion
          publicacionInicial={PUBLICACION_BASE}
          onExito={vi.fn()}
          onCancelar={vi.fn()}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

      await waitFor(() => {
        expect(publicacionesService.actualizar).toHaveBeenCalled();
      });
      expect(publicacionesService.crear).not.toHaveBeenCalled();
    });
  });
});
