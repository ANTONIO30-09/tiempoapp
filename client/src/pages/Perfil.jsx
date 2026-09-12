import React from 'react';
import { useAuth } from '../context/AuthContext';
import FormularioEdicionPerfil from '../components/FormularioEdicionPerfil';

export default function Perfil() {
  const { usuario } = useAuth();

  if (!usuario) {
    return (
      <section className="py-8 text-center text-gray-600">
        No hay usuario autenticado.
      </section>
    );
  }

  return (
    <section className="py-8 space-y-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mi perfil</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Nombre</dt>
            <dd className="text-gray-900 font-medium">
              {usuario.nombre} {usuario.apellido}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Email</dt>
            <dd className="text-gray-900">{usuario.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Ciudad</dt>
            <dd className="text-gray-900">{usuario.ciudad}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Créditos de tiempo</dt>
            <dd className="text-gray-900 font-medium">{usuario.creditos_tiempo}</dd>
          </div>
        </dl>

        {usuario.habilidades && usuario.habilidades.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {usuario.habilidades.map((h, i) => (
                <span
                  key={i}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {usuario.descripcion && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Descripción</h3>
            <p className="text-sm text-gray-700">{usuario.descripcion}</p>
          </div>
        )}
      </div>

      <FormularioEdicionPerfil />
    </section>
  );
}
