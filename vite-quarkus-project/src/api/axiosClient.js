/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 12000,
})

axiosClient.interceptors.request.use((config) => {
  // Ako postoji pravi token iz login procesa, on ima prioritet nad demo autentifikacijom.
  const token = localStorage.getItem('building_manager_token') || localStorage.getItem('moja_zgrada_token')
  if (token) {
    config.headers.Authorization = token.startsWith('Basic ') ? token : `Bearer ${token}`
  } else {
    // U demo rezimu backend prihvata Basic naloge: admin/starjesina/stanar sa demo lozinkom.
    const role = localStorage.getItem('building_manager_role') || 'admin'
    config.headers.Authorization = `Basic ${window.btoa(`${role}:Demo12345!`)}`
  }
  return config
})

export function getApiMessage(error) {
  // Normalizuje razlicite formate gresaka iz backend-a u jednu poruku za UI.
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  return 'Došlo je do greške. Pokušajte ponovo.'
}

export default axiosClient

