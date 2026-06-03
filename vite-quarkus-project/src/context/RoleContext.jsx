import { createContext, useContext, useMemo, useState } from 'react'

export const roles = [
  { value: 'admin', label: 'Admin', initials: 'AD', description: 'Pun pristup sistemu' },
  { value: 'starjesina', label: 'Starješina', initials: 'ST', description: 'Upravljanje ulazom' },
  { value: 'stanar', label: 'Stanar', initials: 'SN', description: 'Jednostavan stanarski prikaz' },
]

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem('building_manager_role') || 'admin')

  function setRole(nextRole) {
    setRoleState(nextRole)
    localStorage.setItem('building_manager_role', nextRole)
  }

  const activeRole = roles.find((item) => item.value === role) || roles[0]
  const value = useMemo(() => ({ role, activeRole, roles, setRole }), [role, activeRole])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole mora biti korišćen unutar RoleProvider.')
  }
  return context
}
