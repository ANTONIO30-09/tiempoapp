import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatbotWidget from './ChatbotWidget';
import { preguntar } from '../services/chatbotService';

vi.mock('../services/chatbotService', () => ({ preguntar: vi.fn() }));

describe('ChatbotWidget', () => {
  beforeEach(() => {
    preguntar.mockReset();
  });
  afterEach(() => cleanup());

  it('inicia cerrado y se abre al hacer clic', async () => {
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    expect(screen.queryByLabelText('Mensaje')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    expect(screen.getByLabelText('Mensaje')).toBeInTheDocument();
    expect(screen.getByText(/Soy el asistente de TIEMPOAPP/i)).toBeInTheDocument();
  });

  it('se cierra con el botón de cerrar', async () => {
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    await user.click(screen.getByRole('button', { name: /cerrar asistente/i }));
    expect(screen.getByRole('button', { name: /abrir asistente/i })).toBeInTheDocument();
  });

  it('envía la pregunta y muestra la respuesta', async () => {
    preguntar.mockResolvedValue('Es un banco de tiempo.');
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    await user.type(screen.getByLabelText('Mensaje'), 'qué es esto');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(preguntar).toHaveBeenCalledWith('qué es esto', []);
    expect(await screen.findByText('Es un banco de tiempo.')).toBeInTheDocument();
    expect(screen.getByText('qué es esto')).toBeInTheDocument();
  });

  it('muestra el mensaje de error del servidor', async () => {
    preguntar.mockRejectedValue({ response: { data: { mensaje: 'Demasiadas preguntas.' } } });
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    await user.type(screen.getByLabelText('Mensaje'), 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Demasiadas preguntas.')).toBeInTheDocument();
  });

  it('usa un mensaje genérico si no hay detalle del servidor', async () => {
    preguntar.mockRejectedValue(new Error('red'));
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    await user.type(screen.getByLabelText('Mensaje'), 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText(/No pude responder ahora/i)).toBeInTheDocument();
  });

  it('una sugerencia envía su texto', async () => {
    preguntar.mockResolvedValue('Respuesta.');
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    await user.click(screen.getByRole('button', { name: '¿Qué es TIEMPOAPP?' }));
    expect(preguntar).toHaveBeenCalledWith('¿Qué es TIEMPOAPP?', []);
    expect(await screen.findByText('Respuesta.')).toBeInTheDocument();
  });

  it('el botón Enviar está deshabilitado con el campo vacío', async () => {
    const user = userEvent.setup();
    render(<ChatbotWidget />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });
});
