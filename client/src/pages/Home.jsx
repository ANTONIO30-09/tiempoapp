import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { autenticado, usuario } = useAuth();

  return (
    <section className="max-w-3xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">TIEMPOAPP</h1>
      <p className="text-lg text-gray-700 mb-8">
        Intercambia habilidades y servicios usando el tiempo como unidad de valor.
        Sin dinero de por medio: das una hora, recibes una hora.
      </p>

      {autenticado ? (
        <div className="space-y-3">
          <p className="text-gray-700">
            Hola, <span className="font-semibold">{usuario?.nombre}</span>.
          </p>
          <Link
            to="/perfil"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Ir a mi perfil
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          <Link
            to="/registro"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Crear cuenta
          </Link>
          <Link
            to="/login"
            className="inline-block border border-indigo-600 text-indigo-600 px-6 py-2 rounded hover:bg-indigo-50"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </section>
  );
}
