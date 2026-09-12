import React, { useEffect, useMemo, useState } from 'react';
import * as creditosService from '../services/creditosService';
import * as usuarioService from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';

export default function FormularioTransferencia({ onExito, onCancelar }) {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [receptorId, setReceptorId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [horas, setHoras] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    usuarioService
      .listar()
      .then((data) => {
        if (activo) setUsuarios(data);
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar la lista de usuarios.');
      })
      .finally(() => {
        if (activo) setCargandoUsuarios(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const candidatos = useMemo(() => {
    return usuarios.filter((u) => u.id !== usuario?.id);
  }, [usuarios, usuario]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return candidatos;
    const q = busqueda.trim().toLowerCase();
    return candidatos.filter((u) => {
      const nombre = `${u.nombre} ${u.apellido}`.toLowerCase();
      const email = u.email.toLowerCase();
      return nombre.includes(q) || email.includes(q);
    });
  }, [candidatos, busqueda]);

  function seleccionar(u) {
    setReceptorId(u.id);
    setBusqueda(`${u.nombre} ${u.apellido}`);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!receptorId) {
      setError('Selecciona un destinatario de la lista.');
      return;
    }
    const horasNum = Number(horas);
    if (!Number.isFinite(horasNum) || horasNum <= 0) {
      setError('Las horas deben ser un número mayor que cero.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await creditosService.transferir({
        receptor_id: receptorId,
        horas: horasNum,
        descripcion: descripcion.trim() || undefined,
      });
      onExito(resultado);
    } catch (err) {
      const msg = err?.response?.data?.mensaje || 'No se pudo completar la transferencia.';
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
      <h3 className="text-lg font-semibold text-gray-900">Transferir horas</h3>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-gray-700">Destinatario</span>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setReceptorId('');
          }}
          placeholder="Buscar por nombre o email..."
          disabled={cargandoUsuarios}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      {!cargandoUsuarios && busqueda && !receptorId && filtrados.length > 0 && (
        <ul className="border border-gray-200 rounded max-h-40 overflow-auto text-sm">
          {filtrados.slice(0, 6).map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => seleccionar(u)}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50"
              >
                <span className="font-medium text-gray-900">{u.nombre} {u.apellido}</span>
                <span className="block text-xs text-gray-500">{u.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!cargandoUsuarios && busqueda && !receptorId && filtrados.length === 0 && (
        <p className="text-xs text-gray-500">Sin coincidencias.</p>
      )}

      {receptorId && (
        <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
          Destinatario seleccionado. Puedes cambiar la búsqueda para elegir otro.
        </p>
      )}

      <label className="block">
        <span className="text-sm text-gray-700">Cantidad de horas</span>
        <input
          type="number"
          step="0.25"
          min="0"
          value={horas}
          onChange={(e) => setHoras(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Descripción (opcional)</span>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Clase de guitarra"
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Confirmar transferencia'}
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
