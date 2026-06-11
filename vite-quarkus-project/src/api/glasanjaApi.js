/*
 * Komentar projekta: API helper za online glasanja.
 */

import axiosClient from './axiosClient.js'

export const glasanjaApi = {
  list: async ({ ulazId, stanarId } = {}) => {
    const params = new URLSearchParams()
    if (ulazId) params.set('ulazId', ulazId)
    if (stanarId) params.set('stanarId', stanarId)
    const query = params.toString()
    return (await axiosClient.get(`/glasanja${query ? `?${query}` : ''}`)).data
  },
  create: async (payload) => (await axiosClient.post('/glasanja', payload)).data,
  vote: async (id, payload) => (await axiosClient.post(`/glasanja/${id}/glas`, payload)).data,
}
