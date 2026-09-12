import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardSaldo from './CardSaldo';

describe('CardSaldo', () => {
  it('renderiza el label y el botón', () => {
    render(<CardSaldo saldo={5} cargando={false} onTransferirClick={() => {}} />);
    expect(screen.getByText(/horas disponibles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transferir horas/i })).toBeInTheDocument();
  });

  it('muestra el saldo recibido cuando no está cargando', () => {
    render(<CardSaldo saldo={2.5} cargando={false} onTransferirClick={() => {}} />);
    expect(screen.getByText('2.5')).toBeInTheDocument();
  });

  it('muestra puntos suspensivos mientras carga', () => {
    render(<CardSaldo saldo={2.5} cargando={true} onTransferirClick={() => {}} />);
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.queryByText('2.5')).not.toBeInTheDocument();
  });

  it('llama a onTransferirClick al hacer clic en el botón', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<CardSaldo saldo={5} cargando={false} onTransferirClick={onClick} />);

    await user.click(screen.getByRole('button', { name: /transferir horas/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
