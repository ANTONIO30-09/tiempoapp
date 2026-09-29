import React from 'react';

const ETIQUETA_MODALIDAD = {
  presencial: 'Presencial',
  remota: 'Remota',
  ambas: 'Presencial o remota',
};

export default function TarjetaPublicacion({ publicacion, usuarioActual, onEditar, onEliminar }) {
  if (!publicacion) return null;

  const esAutor =
    usuarioActual && String(publicacion.autor_id) === String(usuarioActual.id);

  const autorNombre = publicacion.autor
    ? `${publicacion.autor.nombre || ''} ${publicacion.autor.apellido || ''}`.trim()
    : null;

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{publicacion.titulo}</h3>
          {autorNombre && (
            <p className="text-xs text-gray-500">
              Publicado por {autorNombre}
              {publicacion.autor?.ciudad ? ` · ${publicacion.autor.ciudad}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {publicacion.activa === false && (
            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
              Inactiva
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700">
            {ETIQUETA_MODALIDAD[publicacion.modalidad] || publicacion.modalidad}
          </span>
        </div>
      </header>

      {publicacion.descripcion && (
        <p className="text-sm text-gray-700 whitespace-pre-line">{publicacion.descripcion}</p>
      )}

      <ul className="flex flex-wrap gap-2 text-xs">
        <li className="px-2 py-1 rounded bg-gray-100 text-gray-700">
          {publicacion.horas_estimadas} h estimadas
        </li>
        {publicacion.ciudad && (
          <li className="px-2 py-1 rounded bg-gray-100 text-gray-700">
            {publicacion.ciudad}
          </li>
        )}
        {Array.isArray(publicacion.habilidades) &&
          publicacion.habilidades.map((h) => (
            <li
              key={h}
              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700"
            >
              {h}
            </li>
          ))}
      </ul>

      {esAutor && (
        <footer className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onEditar && onEditar(publicacion)}
            className="text-sm font-semibold px-3 py-1.5 rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onEliminar && onEliminar(publicacion)}
            className="text-sm font-semibold px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 transition"
          >
            Eliminar
          </button>
        </footer>
      )}
    </article>
  );
}
