import React from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Creditos from './pages/Creditos';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-500 py-4">
        TIEMPOAPP — UNIFRANZ, PGM-611, 2026
      </footer>
    </div>
  );
}

function NoEncontrada() {
  return (
    <section className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-600 mb-6">Página no encontrada.</p>
      <Link to="/" className="text-indigo-600 hover:underline">
        Volver al inicio
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creditos"
          element={
            <ProtectedRoute>
              <Creditos />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
