import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as publicacionesService from '../services/publicacionesService';
import TarjetaPublicacion from '../components/TarjetaPublicacion';
import FormularioPublicacion from '../components/FormularioPublicacion';

const FILTROS_VACIOS = { habilidad: '', ciudad: '', texto: '' };

export default function Publicaciones() {
  const { usuario } = useAuth();

  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VACIOS);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [publicacionEnEdicion, setPublicacionEnEdicion] = useState(null);

  const formRef = useRef(null);

  const cargarPublicaciones = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtrosAplicados).filter(([, v]) => v && String(v).trim() !== '')
      );
      const data = await publicacionesService.listar(filtrosLimpios);
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('No se pudieron cargar las publicaciones.');
    } finally {
      setCargando(false);
    }
  }, [filtrosAplicados]);

  useEffect(() => {
    cargarPublicaciones();
  }, [cargarPublicaciones]);

  function aplicarFiltros(e) {
    e.preventDefault();
    setFiltrosAplicados({ ...filtros });
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
    setFiltrosAplicados(FILTROS_VACIOS);
  }

  function abrirCrear() {
    setPublicacionEnEdicion(null);
    setMostrarFormulario(true);
    setTimeout(() => formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);
  }

  function abrirEditar(pub) {
    setPublicacionEnEdicion(pub);
    setMostrarFormulario(true);
    setTimeout(() => formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);
  }

  function cancelarFormulario() {
    setMostrarFormulario(false);
    setPublicacionEnEdicion(null);
  }

  async function manejarExito() {
    setMensaje(
      publicacionEnEdicion ? 'Publicación actualizada correctamente.' : 'Publicación creada correctamente.'
    );
    setMostrarFormulario(false);
    setPublicacionEnEdicion(null);
    await cargarPublicaciones();
    setTimeout(() => setMensaje(''), 4000);
  }

  async function manejarEliminar(pub) {
    const confirmado = window.confirm(`¿Eliminar la publicación "${pub.titulo}"?`);
    if (!confirmado) return;
    try {
      await publicacionesService.eliminar(pub.id);
      setMensaje('Publicación eliminada correctamente.');
      await cargarPublicaciones();
      setTimeout(() => setMensaje(''), 4000);
    } catch (err) {
      setError('No se pudo eliminar la publicación.');
    }
  }

  const vacio = useMemo(
    () => !cargando && publicaciones.length === 0,
    [cargando, publicaciones]
  );

  return (
    <section className="max-w-3xl mx-auto py-6 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Publicaciones de servicios</h1>
        <button
          type="button"
          onClick={abrirCrear}
          className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Nueva publicación
        </button>
      </header>

      {mensaje && (
        <p role="status" className="text-sm text-green-700 bg-green-50 p-3 rounded">
          {mensaje}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}

      <div ref={formRef}>
        {mostrarFormulario && (
          <FormularioPublicacion
            publicacionInicial={publicacionEnEdicion}
            onExito={manejarExito}
            onCancelar={cancelarFormulario}
          />
        )}
      </div>

      <form
        onSubmit={aplicarFiltros}
        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3"
      >
        <h2 className="text-lg font-semibold text-gray-900">Filtrar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-gray-700">Habilidad</span>
            <input
              type="text"
              value={filtros.habilidad}
              onChange={(e) => setFiltros((f) => ({ ...f, habilidad: e.target.value }))}
              placeholder="Ej: cocina"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Ciudad</span>
            <input
              type="text"
              value={filtros.ciudad}
              onChange={(e) => setFiltros((f) => ({ ...f, ciudad: e.target.value }))}
              placeholder="Ej: Cochabamba"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Buscar en título</span>
            <input
              type="text"
              value={filtros.texto}
              onChange={(e) => setFiltros((f) => ({ ...f, texto: e.target.value }))}
              placeholder="Ej: guitarra"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {cargando && (
          <p className="text-sm text-gray-500" role="status">
            Cargando publicaciones...
          </p>
        )}

        {!cargando && vacio && (
          <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-5">
            No hay publicaciones que coincidan con los filtros.
          </p>
        )}

        {!cargando &&
          publicaciones.map((pub) => (
            <TarjetaPublicacion
              key={pub.id}
              publicacion={pub}
              usuarioActual={usuario}
              onEditar={abrirEditar}
              onEliminar={manejarEliminar}
            />
          ))}
      </div>
    </section>
  );
}
