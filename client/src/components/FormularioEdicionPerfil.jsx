import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as usuarioService from '../services/usuarioService';

export default function FormularioEdicionPerfil() {
  const { usuario, actualizarPerfil } = useAuth();
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    email: usuario?.email || '',
    habilidades: (usuario?.habilidades || []).join(', '),
    descripcion: usuario?.descripcion || '',
    password: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!usuario?.id) {
      setError('No hay usuario autenticado.');
      return;
    }

    const habilidades = datos.habilidades
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const payload = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.email.trim(),
      habilidades,
      descripcion: datos.descripcion.trim(),
    };
    if (datos.password) {
      payload.password = datos.password;
    }

    setEnviando(true);
    try {
      const actualizado = await usuarioService.actualizar(usuario.id, payload);
      actualizarPerfil(actualizado);
      setDatos((prev) => ({ ...prev, password: '' }));
      setMensaje('Perfil actualizado correctamente.');
    } catch (err) {
      const msg = err?.response?.data?.mensaje || 'No se pudo actualizar el perfil.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-900">Editar perfil</h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="text-sm text-green-700 bg-green-50 p-2 rounded">
          {mensaje}
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
        <span className="text-sm text-gray-700">Habilidades (separadas por coma)</span>
        <input
          type="text"
          name="habilidades"
          value={datos.habilidades}
          onChange={manejarCambio}
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

      <label className="block">
        <span className="text-sm text-gray-700">Nueva contraseña (opcional)</span>
        <input
          type="password"
          name="password"
          value={datos.password}
          onChange={manejarCambio}
          placeholder="Dejar en blanco para no cambiar"
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {enviando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
