import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FormularioLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }

    setEnviando(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/perfil');
    } catch (err) {
      const msg = err?.response?.data?.mensaje || 'Credenciales inválidas.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-900">Iniciar sesión</h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Contraseña</span>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {enviando ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="text-sm text-gray-600 text-center">
        ¿No tienes cuenta? <Link to="/registro" className="text-indigo-600 hover:underline">Regístrate</Link>
      </p>
    </form>
  );
}
