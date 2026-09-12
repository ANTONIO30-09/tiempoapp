import React from 'react';

export default function CardSaldo({ saldo, onTransferirClick, cargando }) {
  return (
    <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg">
      <p className="text-sm uppercase tracking-wide opacity-80">Horas disponibles</p>
      <div className="mt-2 flex items-end justify-between flex-wrap gap-4">
        <p className="text-5xl font-bold leading-none">
          {cargando ? '...' : saldo}
        </p>
        <button
          type="button"
          onClick={onTransferirClick}
          className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-lg hover:bg-indigo-50 transition"
        >
          Transferir horas
        </button>
      </div>
      <p className="text-xs opacity-75 mt-3">
        El tiempo se mide en horas. Puedes enviar parte de tu saldo a otros usuarios.
      </p>
    </section>
  );
}
