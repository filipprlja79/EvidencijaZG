/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import axiosClient from './axiosClient.js'

export const zgradeApi = {
  list: async () => (await axiosClient.get('/zgrade')).data,
  create: async (payload) => (await axiosClient.post('/zgrade', payload)).data,
  update: async (id, payload) => (await axiosClient.put(`/zgrade/${id}`, payload)).data,
  remove: async (id) => (await axiosClient.delete(`/zgrade/${id}`)).data,
}

