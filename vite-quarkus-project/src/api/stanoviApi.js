/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import axiosClient from './axiosClient.js'

export const stanoviApi = {
  list: async () => (await axiosClient.get('/stanovi')).data,
  listByUlaz: async (ulazId) => (await axiosClient.get(`/stanovi/ulaz/${ulazId}`)).data,
  create: async (payload) => (await axiosClient.post('/stanovi', payload)).data,
  update: async (id, payload) => (await axiosClient.put(`/stanovi/${id}`, payload)).data,
  remove: async (id) => (await axiosClient.delete(`/stanovi/${id}`)).data,
}

