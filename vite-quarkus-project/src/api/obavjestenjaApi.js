import axiosClient from './axiosClient.js'

export const obavjestenjaApi = {
  list: async () => (await axiosClient.get('/obavjestenja')).data,
  create: async (payload) => (await axiosClient.post('/obavjestenja', payload)).data,
  send: async (payload) => (await axiosClient.post('/obavjestenja/posalji', payload)).data,
  update: async (id, payload) => (await axiosClient.put(`/obavjestenja/${id}`, payload)).data,
  remove: async (id) => (await axiosClient.delete(`/obavjestenja/${id}`)).data,
}
