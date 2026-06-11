/*
 * Komentar projekta: API helper za autentifikaciju korisnika.
 */

import axiosClient from './axiosClient.js'

export async function loginUser(payload) {
  const { data } = await axiosClient.post('/auth/login', payload)
  return data
}

export async function registerUser(payload) {
  const { data } = await axiosClient.post('/auth/register', payload)
  return data
}

export async function fetchDemoAccounts() {
  const { data } = await axiosClient.get('/auth/demo-accounts')
  return data
}

export async function fetchCurrentUser() {
  const { data } = await axiosClient.get('/auth/me')
  return data
}
