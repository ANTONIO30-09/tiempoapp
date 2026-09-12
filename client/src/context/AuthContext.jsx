import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';
import { TOKEN_KEY, USUARIO_KEY } from '../services/api';

const AuthContext = createContext(null);

function leerEstadoInicial() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const usuarioRaw = localStorage.getItem(USUARIO_KEY);
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    return { token, usuario };
  } catch {
    return { token: null, usuario: null };
  }
}

export function AuthProvider({ children }) {
  const inicial = leerEstadoInicial();
  const [usuario, setUsuario] = useState(inicial.usuario);
  const [token, setToken] = useState(inicial.token);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (token && usuario) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
    }
  }, [token, usuario]);

  async function login(credenciales) {
    setCargando(true);
    try {
      const data = await authService.login(credenciales);
      setToken(data.token);
      setUsuario(data.usuario);
      return data;
    } finally {
      setCargando(false);
    }
  }

  async function registro(datos) {
    setCargando(true);
    try {
      const data = await authService.registro(datos);
      setToken(data.token);
      setUsuario(data.usuario);
      return data;
    } finally {
      setCargando(false);
    }
  }

  function logout() {
    setToken(null);
    setUsuario(null);
  }

  function actualizarPerfil(datos) {
    setUsuario((prev) => (prev ? { ...prev, ...datos } : prev));
  }

  const value = {
    usuario,
    token,
    cargando,
    autenticado: Boolean(token && usuario),
    login,
    registro,
    logout,
    actualizarPerfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

export { TOKEN_KEY, USUARIO_KEY };
export default AuthContext;
