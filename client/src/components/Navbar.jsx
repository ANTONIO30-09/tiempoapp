import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { autenticado, usuario, logout } = useAuth();
  const navigate = useNavigate();

  function manejarLogout() {
    logout();
    navigate('/');
  }

  const enlaceClase = ({ isActive }) =>
    `px-3 py-1 rounded text-sm ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'
    }`;

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-700">
          TIEMPOAPP
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/" end className={enlaceClase}>
            Inicio
          </NavLink>

          {autenticado ? (
            <>
              <NavLink to="/creditos" className={enlaceClase}>
                Créditos
              </NavLink>
              <NavLink to="/perfil" className={enlaceClase}>
                {usuario?.nombre || 'Perfil'}
              </NavLink>
              <button
                type="button"
                onClick={manejarLogout}
                className="px-3 py-1 text-sm text-gray-700 hover:text-red-600"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={enlaceClase}>
                Ingresar
              </NavLink>
              <NavLink to="/registro" className={enlaceClase}>
                Registrarme
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
