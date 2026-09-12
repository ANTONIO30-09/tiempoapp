import api from './api';

export async function transferir(datos) {
  const { data } = await api.post('/api/creditos/transferir', datos);
  return data;
}

export async function historial() {
  const { data } = await api.get('/api/creditos/historial');
  return data;
}

export async function saldo() {
  const { data } = await api.get('/api/creditos/saldo');
  return data;
}
