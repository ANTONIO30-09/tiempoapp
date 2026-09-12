import api from './api';

export async function registro(datos) {
  const { data } = await api.post('/api/auth/registro', datos);
  return data;
}

export async function login(credenciales) {
  const { data } = await api.post('/api/auth/login', credenciales);
  return data;
}
