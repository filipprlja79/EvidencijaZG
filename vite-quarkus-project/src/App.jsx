/*
 * Komentar projekta: Ulazni React fajl koji pokrece aplikaciju ili povezuje glavne providere.
 */

import { ToastProvider } from './context/ToastContext.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRouter from './router/AppRouter.jsx'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RoleProvider>
          <AppRouter />
        </RoleProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

