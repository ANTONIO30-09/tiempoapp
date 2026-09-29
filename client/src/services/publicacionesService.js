import api from './api';

export async function listar(filtros = {}) {
  const { data } = await api.get('/api/publicaciones', { params: filtros });
  return data;
}

export async function obtener(id) {
  const { data } = await api.get(`/api/publicaciones/${id}`);
  return data;
}

export async function crear(datos) {
  const { data } = await api.post('/api/publicaciones', datos);
  return data;
}

export async function actualizar(id, datos) {
  const { data } = await api.put(`/api/publicaciones/${id}`, datos);
  return data;
}

export async function eliminar(id) {
  const { data } = await api.delete(`/api/publicaciones/${id}`);
  return data;
}
