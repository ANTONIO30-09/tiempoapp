import api from './api';

export async function listar() {
  const { data } = await api.get('/api/usuarios');
  return data;
}

export async function obtener(id) {
  const { data } = await api.get(`/api/usuarios/${id}`);
  return data;
}

export async function actualizar(id, datos) {
  const { data } = await api.put(`/api/usuarios/${id}`, datos);
  return data;
}

export async function eliminar(id) {
  const { data } = await api.delete(`/api/usuarios/${id}`);
  return data;
}
