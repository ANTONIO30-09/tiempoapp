import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioTransferencia from './FormularioTransferencia';

const EMISOR = { id: 'emisor-1', nombre: 'Ana', apellido: 'Perez', email: 'ana@test.com' };
const RECEPTOR = { id: 'receptor-1', nombre: 'Nino', apellido: 'Garcia', email: 'nino@test.com' };

vi.mock('../services/creditosService', () => ({
  transferir: vi.fn(),
  historial: vi.fn(),
  saldo: vi.fn(),
}));

vi.mock('../services/usuarioService', () => ({
  listar: vi.fn(),
  obtener: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ usuario: EMISOR }),
}));

import * as creditosService from '../services/creditosService';
import * as usuarioService from '../services/usuarioService';

describe('FormularioTransferencia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usuarioService.listar.mockResolvedValue([EMISOR, RECEPTOR]);
  });

  it('renderiza los campos y el botón confirmar', async () => {
    render(<FormularioTransferencia onExito={() => {}} onCancelar={() => {}} />);
    expect(screen.getByText(/transferir horas/i)).toBeInTheDocument();
    expect(screen.getByText('Destinatario')).toBeInTheDocument();
    expect(screen.getByText('Cantidad de horas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar transferencia/i })).toBeInTheDocument();
  });

  it('muestra error si no se selecciona destinatario', async () => {
    const user = userEvent.setup();
    render(<FormularioTransferencia onExito={() => {}} onCancelar={() => {}} />);

    await user.type(screen.getByLabelText(/destinatario/i), 'Nino');
    await user.type(screen.getByLabelText(/cantidad de horas/i), '2');
    await user.click(screen.getByRole('button', { name: /confirmar transferencia/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/selecciona un destinatario/i);
    expect(creditosService.transferir).not.toHaveBeenCalled();
  });

  it('muestra error si horas no es número positivo', async () => {
    const user = userEvent.setup();
    render(<FormularioTransferencia onExito={() => {}} onCancelar={() => {}} />);

    await user.click(screen.getByRole('button', { name: /confirmar transferencia/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/destinatario/i);

    await user.type(screen.getByLabelText(/cantidad de horas/i), '0');
    await user.click(screen.getByRole('button', { name: /confirmar transferencia/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/destinatario/i);
  });

  it('filtra usuarios por nombre y excluye al propio emisor', async () => {
    const user = userEvent.setup();
    render(<FormularioTransferencia onExito={() => {}} onCancelar={() => {}} />);

    await waitFor(() => expect(usuarioService.listar).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/destinatario/i), 'Nino');

    expect(screen.getByText('Nino Garcia')).toBeInTheDocument();
    expect(screen.queryByText('Ana Perez')).not.toBeInTheDocument();
  });

  it('llama a transferir con los datos correctos y dispara onExito', async () => {
    const onExito = vi.fn();
    const user = userEvent.setup();
    const respuesta = { transaccion: { id: 'trx-1', horas: 2 }, saldo: 3 };
    creditosService.transferir.mockResolvedValueOnce(respuesta);

    render(<FormularioTransferencia onExito={onExito} onCancelar={() => {}} />);

    await waitFor(() => expect(usuarioService.listar).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/destinatario/i), 'Nino');
    await user.click(screen.getByRole('button', { name: /Nino Garcia/i }));
    await user.type(screen.getByLabelText(/cantidad de horas/i), '2');
    await user.type(screen.getByLabelText(/descripción/i), 'Clase');
    await user.click(screen.getByRole('button', { name: /confirmar transferencia/i }));

    await waitFor(() => {
      expect(creditosService.transferir).toHaveBeenCalledWith({
        receptor_id: 'receptor-1',
        horas: 2,
        descripcion: 'Clase',
      });
    });
    expect(onExito).toHaveBeenCalledWith(respuesta);
  });

  it('muestra error del backend si la transferencia falla', async () => {
    const user = userEvent.setup();
    creditosService.transferir.mockRejectedValueOnce({
      response: { data: { mensaje: 'Saldo insuficiente.' } },
    });

    render(<FormularioTransferencia onExito={() => {}} onCancelar={() => {}} />);

    await waitFor(() => expect(usuarioService.listar).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/destinatario/i), 'Nino');
    await user.click(screen.getByRole('button', { name: /Nino Garcia/i }));
    await user.type(screen.getByLabelText(/cantidad de horas/i), '5');
    await user.click(screen.getByRole('button', { name: /confirmar transferencia/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/saldo insuficiente/i);
    });
  });
});
