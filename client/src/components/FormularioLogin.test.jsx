import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FormularioLogin from './FormularioLogin';
import { useAuth } from '../context/AuthContext';

const navigateMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderizar() {
  return render(
    <MemoryRouter>
      <FormularioLogin />
    </MemoryRouter>
  );
}

describe('FormularioLogin', () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: loginMock });
  });

  it('renderiza campos y botón', () => {
    renderizar();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('muestra error si email o password están vacíos', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/obligatorios/i);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('llama a login y navega a /perfil', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({ token: 't', usuario: { id: '1' } });
    renderizar();

    await user.type(screen.getByText('Email').parentElement.querySelector('input'), 'ana@test.com');
    await user.type(screen.getByText('Contraseña').parentElement.querySelector('input'), 'secreto123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'ana@test.com',
        password: 'secreto123',
      });
    });
    expect(navigateMock).toHaveBeenCalledWith('/perfil');
  });

  it('muestra error del backend en credenciales inválidas', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce({
      response: { data: { mensaje: 'Credenciales inválidas.' } },
    });
    renderizar();

    await user.type(screen.getByText('Email').parentElement.querySelector('input'), 'ana@test.com');
    await user.type(screen.getByText('Contraseña').parentElement.querySelector('input'), 'mala');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/credenciales inválidas/i);
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
