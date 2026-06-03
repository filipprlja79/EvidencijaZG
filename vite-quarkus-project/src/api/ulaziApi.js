/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import axiosClient from './axiosClient.js'

export const ulaziApi = {
  list: async () => (await axiosClient.get('/ulazi')).data,
  create: async (payload) => (await axiosClient.post('/ulazi', payload)).data,
  update: async (id, payload) => (await axiosClient.put(`/ulazi/${id}`, payload)).data,
  remove: async (id) => (await axiosClient.delete(`/ulazi/${id}`)).data,
}

