import React, { useState } from 'react';
import * as publicacionesService from '../services/publicacionesService';

const MODALIDADES = [
  { valor: 'presencial', etiqueta: 'Presencial' },
  { valor: 'remota', etiqueta: 'Remota' },
  { valor: 'ambas', etiqueta: 'Presencial o remota' },
];

const MODALIDADES_VALIDAS = MODALIDADES.map((m) => m.valor);

function habilidadesAString(habilidades) {
  if (!Array.isArray(habilidades)) return '';
  return habilidades.join(', ');
}

function stringAHabilidades(texto) {
  return texto
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
}

export default function FormularioPublicacion({
  publicacionInicial = null,
  onExito,
  onCancelar,
}) {
  const esEdicion = Boolean(publicacionInicial);

  const [titulo, setTitulo] = useState(publicacionInicial?.titulo || '');
  const [descripcion, setDescripcion] = useState(publicacionInicial?.descripcion || '');
  const [horasEstimadas, setHorasEstimadas] = useState(
    publicacionInicial?.horas_estimadas != null ? String(publicacionInicial.horas_estimadas) : ''
  );
  const [habilidadesTexto, setHabilidadesTexto] = useState(
    habilidadesAString(publicacionInicial?.habilidades)
  );
  const [ciudad, setCiudad] = useState(publicacionInicial?.ciudad || 'Cochabamba');
  const [modalidad, setModalidad] = useState(publicacionInicial?.modalidad || 'presencial');
  const [activa, setActiva] = useState(
    publicacionInicial?.activa != null ? Boolean(publicacionInicial.activa) : true
  );
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    const horasNum = Number(horasEstimadas);
    if (!Number.isFinite(horasNum) || horasNum <= 0) {
      setError('Las horas estimadas deben ser un número mayor que cero.');
      return;
    }
    if (!MODALIDADES_VALIDAS.includes(modalidad)) {
      setError('Modalidad inválida.');
      return;
    }

    const datos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      horas_estimadas: horasNum,
      habilidades: stringAHabilidades(habilidadesTexto),
      ciudad: ciudad.trim() || 'Cochabamba',
      modalidad,
    };

    setEnviando(true);
    try {
      const resultado = esEdicion
        ? await publicacionesService.actualizar(publicacionInicial.id, {
            ...datos,
            activa,
          })
        : await publicacionesService.crear(datos);
      onExito(resultado);
    } catch (err) {
      const msg =
        err?.response?.data?.mensaje ||
        (esEdicion ? 'No se pudo actualizar la publicación.' : 'No se pudo crear la publicación.');
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        {esEdicion ? 'Editar publicación' : 'Nueva publicación'}
      </h3>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-gray-700">Título</span>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Clases de guitarra para principiantes"
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Descripción (opcional)</span>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          placeholder="Detalles del servicio que ofreces"
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-gray-700">Horas estimadas</span>
          <input
            type="number"
            step="0.25"
            min="0"
            value={horasEstimadas}
            onChange={(e) => setHorasEstimadas(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Ciudad</span>
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Cochabamba"
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-gray-700">Habilidades (separadas por coma)</span>
        <input
          type="text"
          value={habilidadesTexto}
          onChange={(e) => setHabilidadesTexto(e.target.value)}
          placeholder="Ej: guitarra, música, enseñanza"
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Modalidad</span>
        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {MODALIDADES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>
      </label>

      {esEdicion && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            className="h-4 w-4"
          />
          Publicación activa
        </label>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {enviando
            ? 'Guardando...'
            : esEdicion
              ? 'Guardar cambios'
              : 'Crear publicación'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={enviando}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
