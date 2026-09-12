import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FormularioRegistro from './FormularioRegistro';
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
      <FormularioRegistro />
    </MemoryRouter>
  );
}

describe('FormularioRegistro', () => {
  const registroMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ registro: registroMock });
  });

  it('renderiza los campos esperados', () => {
    renderizar();
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText ? screen.getByLabelText(/nombre/i) : screen.getByText('Nombre')).toBeTruthy();
    expect(screen.getByText('Apellido')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
  });

  it('muestra error si faltan campos obligatorios', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole('button', { name: /registrarme/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/obligatorios/i);
    expect(registroMock).not.toHaveBeenCalled();
  });

  it('muestra error si la contraseña es demasiado corta', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByText('Nombre').parentElement.querySelector('input'), 'Ana');
    await user.type(screen.getByText('Apellido').parentElement.querySelector('input'), 'Perez');
    await user.type(screen.getByText('Email').parentElement.querySelector('input'), 'ana@test.com');
    await user.type(screen.getByText('Contraseña').parentElement.querySelector('input'), '123');
    await user.click(screen.getByRole('button', { name: /registrarme/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 6/i);
    expect(registroMock).not.toHaveBeenCalled();
  });

  it('envía datos correctamente y navega a /perfil', async () => {
    const user = userEvent.setup();
    registroMock.mockResolvedValueOnce({ token: 't', usuario: { id: '1' } });
    renderizar();

    await user.type(screen.getByText('Nombre').parentElement.querySelector('input'), 'Ana');
    await user.type(screen.getByText('Apellido').parentElement.querySelector('input'), 'Perez');
    await user.type(screen.getByText('Email').parentElement.querySelector('input'), 'ana@test.com');
    await user.type(screen.getByText('Contraseña').parentElement.querySelector('input'), 'secreto123');
    await user.type(
      screen.getByText(/Habilidades/i).parentElement.querySelector('input'),
      'cocina, guitarra, cocina'
    );
    await user.type(
      screen.getByText('Descripción').parentElement.querySelector('textarea'),
      'Hola mundo'
    );
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(registroMock).toHaveBeenCalledWith({
        nombre: 'Ana',
        apellido: 'Perez',
        email: 'ana@test.com',
        password: 'secreto123',
        habilidades: ['cocina', 'guitarra', 'cocina'],
        descripcion: 'Hola mundo',
      });
    });
    expect(navigateMock).toHaveBeenCalledWith('/perfil');
  });

  it('muestra el mensaje del backend si el registro falla', async () => {
    const user = userEvent.setup();
    registroMock.mockRejectedValueOnce({
      response: { data: { mensaje: 'El email ya está registrado.' } },
    });
    renderizar();

    await user.type(screen.getByText('Nombre').parentElement.querySelector('input'), 'Ana');
    await user.type(screen.getByText('Apellido').parentElement.querySelector('input'), 'Perez');
    await user.type(screen.getByText('Email').parentElement.querySelector('input'), 'ana@test.com');
    await user.type(screen.getByText('Contraseña').parentElement.querySelector('input'), 'secreto123');
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email ya está registrado/i);
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
