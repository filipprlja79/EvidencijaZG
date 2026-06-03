/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import axiosClient from './axiosClient.js'

export const obavjestenjaApi = {
  // CRUD i slanje obavjestenja.
  list: async () => (await axiosClient.get('/obavjestenja')).data,
  create: async (payload) => (await axiosClient.post('/obavjestenja', payload)).data,
  send: async (payload) => (await axiosClient.post('/obavjestenja/posalji', payload)).data,
  update: async (id, payload) => (await axiosClient.put(`/obavjestenja/${id}`, payload)).data,
  remove: async (id) => (await axiosClient.delete(`/obavjestenja/${id}`)).data,
  // Operacije nad fajlovima koji pripadaju pojedinacnom obavjestenju.
  listFiles: async (id) => (await axiosClient.get(`/obavjestenja/${id}/fajlovi`)).data,
  uploadFile: async (id, file) => {
    const formData = new FormData()
    formData.append('filename', file.name)
    formData.append('file', file)
    return (await axiosClient.post(`/obavjestenja/fajlovi?id=${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })).data
  },
  downloadFile: async (fileId) => (await axiosClient.get(`/obavjestenja/fajlovi/${fileId}/download`, {
    // Blob je obavezan jer response nije JSON nego binarni fajl.
    responseType: 'blob',
    // Backend moze vratiti PDF, sliku ili Word dokument, zato ne trazimo samo JSON.
    headers: { Accept: '*/*' },
    timeout: 30000,
  })),
  removeFile: async (fileId) => (await axiosClient.delete(`/obavjestenja/fajlovi/${fileId}`)).data,
}

