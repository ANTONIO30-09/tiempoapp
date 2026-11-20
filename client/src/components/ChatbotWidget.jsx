import { useEffect, useRef, useState } from 'react';
import { preguntar } from '../services/chatbotService';

const MAX_CHARS = 500;
const SUGERENCIAS = [
  '¿Qué es TIEMPOAPP?',
  '¿Cómo intercambio habilidades?',
  '¿Cómo transfiero horas?',
];
const BIENVENIDA = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de TIEMPOAPP. Pregúntame cómo usar la plataforma o cómo intercambiar habilidades.',
  bienvenida: true,
};

export default function ChatbotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([BIENVENIDA]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [mensajes, abierto, enviando]);

  async function enviar(contenido) {
    const msg = contenido.trim();
    if (!msg || enviando) return;

    const historial = mensajes
      .filter((m) => !m.bienvenida && !m.error)
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    setMensajes((prev) => [...prev, { role: 'user', content: msg }]);
    setTexto('');
    setEnviando(true);
    try {
      const respuesta = await preguntar(msg, historial);
      setMensajes((prev) => [...prev, { role: 'assistant', content: respuesta }]);
    } catch (err) {
      const detalle = err?.response?.data?.mensaje || 'No pude responder ahora. Intenta de nuevo.';
      setMensajes((prev) => [...prev, { role: 'assistant', content: detalle, error: true }]);
    } finally {
      setEnviando(false);
    }
  }

  function manejarSubmit(e) {
    e.preventDefault();
    enviar(texto);
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir asistente"
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <span aria-hidden="true">💬</span>
      </button>
    );
  }

  return (
    <section
      aria-label="Asistente de TIEMPOAPP"
      className="fixed bottom-4 right-4 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
    >
      <header className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">Asistente TIEMPOAPP</p>
          <p className="text-xs text-indigo-100">Pregunta sobre la plataforma</p>
        </div>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar asistente"
          className="rounded px-2 py-1 text-lg leading-none hover:bg-indigo-500"
        >
          ×
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3" aria-live="polite">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : m.error
                  ? 'bg-red-50 text-red-700'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}

        {mensajes.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => enviar(s)}
                className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {enviando && (
          <p role="status" className="text-xs italic text-gray-500">
            Escribiendo…
          </p>
        )}
        <div ref={finRef} />
      </div>

      <form onSubmit={manejarSubmit} className="flex gap-2 border-t border-gray-200 bg-white p-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder="Escribe tu pregunta…"
          aria-label="Mensaje"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
