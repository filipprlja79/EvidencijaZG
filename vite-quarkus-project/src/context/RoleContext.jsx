/*
 * Komentar projekta: React context koji dijeli globalno stanje kroz aplikaciju bez prop drilling-a.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

export const roles = [

  { value: 'admin', label: 'Admin', initials: 'AD', description: 'Pun pristup sistemu' },

  { value: 'starjesina', label: 'Starješina', initials: 'ST', description: 'Upravljanje ulazom' },

  { value: 'stanar', label: 'Stanar', initials: 'SN', description: 'Jednostavan stanarski prikaz' },
]

const RoleContext = createContext(null)

export function RoleProvider({ children }) {

  const [role, setRoleState] = useState(() => localStorage.getItem('building_manager_role') || 'admin')
  const { profile } = useAuth()
  const effectiveRole = profile?.role || role

  useEffect(() => {
    if (profile?.role) {
      setRoleState(profile.role)
      localStorage.setItem('building_manager_role', profile.role)
    }
  }, [profile])

  function setRole(nextRole) {
    setRoleState(nextRole)
    localStorage.setItem('building_manager_role', nextRole)

  }

  const activeRole = roles.find((item) => item.value === effectiveRole) || roles[0]

  const value = useMemo(() => ({ role: effectiveRole, activeRole, roles, setRole }), [effectiveRole, activeRole])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>

}

export function useRole() {

  const context = useContext(RoleContext)

  if (!context) {

    throw new Error('useRole mora biti korišćen unutar RoleProvider.')

  }
  return context
}
