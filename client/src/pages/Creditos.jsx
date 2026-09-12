import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as creditosService from '../services/creditosService';
import CardSaldo from '../components/CardSaldo';
import FormularioTransferencia from '../components/FormularioTransferencia';
import HistorialTransacciones from '../components/HistorialTransacciones';

export default function Creditos() {
  const { usuario } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [saldoData, historialData] = await Promise.all([
        creditosService.saldo(),
        creditosService.historial(),
      ]);
      setSaldo(saldoData.creditos_tiempo);
      setTransacciones(historialData);
    } catch (err) {
      setMensaje('No se pudieron cargar los datos de créditos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function manejarExito(resultado) {
    setMensaje('Transferencia realizada correctamente.');
    setMostrarFormulario(false);
    await cargarDatos();
    // Aseguramos que el saldo coincida con el del backend al momento de la operación
    if (resultado && typeof resultado.saldo === 'number') {
      setSaldo(resultado.saldo);
    }
    setTimeout(() => setMensaje(''), 4000);
  }

  return (
    <section className="max-w-3xl mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Créditos de tiempo</h1>

      {mensaje && (
        <p role="status" className="text-sm text-green-700 bg-green-50 p-3 rounded">
          {mensaje}
        </p>
      )}

      <CardSaldo
        saldo={saldo === null ? '--' : saldo}
        cargando={cargando}
        onTransferirClick={() => setMostrarFormulario((v) => !v)}
      />

      {mostrarFormulario && (
        <FormularioTransferencia
          onExito={manejarExito}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Movimientos</h2>
        <HistorialTransacciones
          transacciones={transacciones}
          usuarioId={usuario?.id}
          cargando={cargando}
        />
      </div>
    </section>
  );
}
