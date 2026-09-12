import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const estadoInicial = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  habilidades: '',
  descripcion: '',
};

export default function FormularioRegistro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(estadoInicial);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!datos.nombre || !datos.apellido || !datos.email || !datos.password) {
      setError('Nombre, apellido, email y contraseña son obligatorios.');
      return;
    }
    if (datos.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const habilidades = datos.habilidades
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    setEnviando(true);
    try {
      await registro({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email: datos.email.trim(),
        password: datos.password,
        habilidades,
        descripcion: datos.descripcion.trim(),
      });
      navigate('/perfil');
    } catch (err) {
      const msg = err?.response?.data?.mensaje || 'No se pudo completar el registro.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-900">Crear cuenta</h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-gray-700">Nombre</span>
          <input
            type="text"
            name="nombre"
            value={datos.nombre}
            onChange={manejarCambio}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Apellido</span>
          <input
            type="text"
            name="apellido"
            value={datos.apellido}
            onChange={manejarCambio}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          value={datos.email}
          onChange={manejarCambio}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Contraseña</span>
        <input
          type="password"
          name="password"
          value={datos.password}
          onChange={manejarCambio}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Habilidades (separadas por coma)</span>
        <input
          type="text"
          name="habilidades"
          value={datos.habilidades}
          onChange={manejarCambio}
          placeholder="Ej: jardinería, clases de guitarra, cocina"
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Descripción</span>
        <textarea
          name="descripcion"
          value={datos.descripcion}
          onChange={manejarCambio}
          rows={3}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {enviando ? 'Creando cuenta...' : 'Registrarme'}
      </button>

      <p className="text-sm text-gray-600 text-center">
        ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
