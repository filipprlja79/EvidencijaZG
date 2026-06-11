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
  const token = localStorage.getItem('building_manager_token') || localStorage.getItem('moja_zgrada_token')
  if (token) {
    config.headers.Authorization = token.startsWith('Basic ') ? token : `Bearer ${token}`
  }
  return config
})

export function getApiMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (error?.response?.status === 409) return 'Nalog sa ovim emailom vec postoji. Prijavite se ili koristite drugi email.'
  if (error?.response?.status === 401) return 'Email ili sifra nijesu ispravni.'
  if (error?.response?.status === 400) return 'Provjerite unesene podatke.'
  return 'Doslo je do greske. Pokusajte ponovo.'
}

export default axiosClient
