import axiosClient from './axiosClient.js'

export const stanariApi = {
  list: async () => (await axiosClient.get('/stanari')).data,
  create: async (payload) => (await axiosClient.post('/stanari', payload)).data,
  update: async (id, payload) => (await axiosClient.put(`/stanari/${id}`, payload)).data,
  remove: async (id) => (await axiosClient.delete(`/stanari/${id}`)).data,
}
