/*
 * Komentar projekta: React context za login stanje, token i profil korisnika.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { fetchDemoAccounts, loginUser, registerUser } from '../api/authApi.js'

const TOKEN_KEY = 'building_manager_token'
const PROFILE_KEY = 'building_manager_profile'
const ROLE_KEY = 'building_manager_role'

const AuthContext = createContext(null)

function readStoredProfile() {
  try {
    const value = localStorage.getItem(PROFILE_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function storeSession(authResponse) {
  const token = authResponse.tokenType === 'Basic'
    ? authResponse.accessToken
    : authResponse.accessToken

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(authResponse.profile))
  localStorage.setItem(ROLE_KEY, authResponse.profile?.role || 'stanar')
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [profile, setProfile] = useState(readStoredProfile)

  const isAuthenticated = Boolean(token)

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload)
    storeSession(response)
    setToken(response.accessToken)
    setProfile(response.profile)
    return response
  }, [])

  const register = useCallback(async (payload) => {
    const profileResponse = await registerUser(payload)
    return profileResponse
  }, [])

  const switchDemoRole = useCallback(async (role) => {
    const accounts = await fetchDemoAccounts()
    const account = accounts.find((item) => item.role === role)
    if (!account) {
      throw new Error('Demo nalog za ovu ulogu nije dostupan.')
    }
    return login({
      email: account.email,
      password: account.password,
    })
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('moja_zgrada_token')
    localStorage.removeItem(PROFILE_KEY)
    setToken(null)
    setProfile(null)
  }, [])

  const value = useMemo(() => ({
    isAuthenticated,
    token,
    profile,
    login,
    register,
    switchDemoRole,
    logout,
  }), [isAuthenticated, token, profile, login, register, switchDemoRole, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth mora biti koriscen unutar AuthProvider.')
  }
  return context
}
