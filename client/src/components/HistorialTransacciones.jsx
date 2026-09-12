import React from 'react';

function formatearFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function HistorialTransacciones({ transacciones, usuarioId, cargando }) {
  if (cargando) {
    return <p className="text-sm text-gray-500 text-center py-6">Cargando historial...</p>;
  }

  if (!transacciones || transacciones.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        Aún no tienes movimientos. Cuando envíes o recibas horas, aparecerán aquí.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {transacciones.map((t) => {
        const enviaste = t.emisor_id === usuarioId;
        const otraPersona = enviaste ? t.receptor : t.emisor;
        const nombreOtra = otraPersona
          ? `${otraPersona.nombre} ${otraPersona.apellido}`
          : 'Usuario';

        return (
          <li key={t.id} className="py-3 flex items-center gap-4">
            <span
              className={
                'flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold ' +
                (enviaste ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')
              }
            >
              {enviaste ? '↑' : '↓'}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">
                  {enviaste ? 'Enviaste a' : 'Recibiste de'} {nombreOtra}
                </span>
              </p>
              {t.descripcion && (
                <p className="text-xs text-gray-500 truncate">{t.descripcion}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{formatearFecha(t.created_at)}</p>
            </div>

            <span
              className={
                'text-sm font-semibold whitespace-nowrap ' +
                (enviaste ? 'text-red-600' : 'text-green-600')
              }
            >
              {enviaste ? '-' : '+'}{t.horas} h
            </span>
          </li>
        );
      })}
    </ul>
  );
}
