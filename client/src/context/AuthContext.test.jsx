import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth, TOKEN_KEY, USUARIO_KEY } from './AuthContext';
import * as authService from '../services/authService';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  registro: vi.fn(),
}));

function Consumidor() {
  const { usuario, token, autenticado, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="usuario">{usuario ? usuario.email : 'sin-usuario'}</span>
      <span data-testid="token">{token || 'sin-token'}</span>
      <span data-testid="autenticado">{autenticado ? 'si' : 'no'}</span>
      <button onClick={() => login({ email: 'test@test.com', password: 'abc123' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('useAuth lanza error fuera del AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumidor />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });

  it('inicia sin usuario ni token', () => {
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    expect(screen.getByTestId('usuario')).toHaveTextContent('sin-usuario');
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token');
    expect(screen.getByTestId('autenticado')).toHaveTextContent('no');
  });

  it('login guarda usuario, token y persiste en localStorage', async () => {
    authService.login.mockResolvedValueOnce({
      token: 'jwt-falso',
      usuario: { id: '1', email: 'test@test.com', nombre: 'Ana' },
    });

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('login').click();
    });

    expect(screen.getByTestId('usuario')).toHaveTextContent('test@test.com');
    expect(screen.getByTestId('token')).toHaveTextContent('jwt-falso');
    expect(screen.getByTestId('autenticado')).toHaveTextContent('si');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-falso');
    expect(JSON.parse(localStorage.getItem(USUARIO_KEY))).toEqual({
      id: '1',
      email: 'test@test.com',
      nombre: 'Ana',
    });
  });

  it('logout limpia estado y localStorage', async () => {
    authService.login.mockResolvedValueOnce({
      token: 'jwt-falso',
      usuario: { id: '1', email: 'test@test.com' },
    });

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('login').click();
    });
    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(screen.getByTestId('usuario')).toHaveTextContent('sin-usuario');
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USUARIO_KEY)).toBeNull();
  });
});
