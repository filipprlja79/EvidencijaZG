import { ToastProvider } from './context/ToastContext.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import AppRouter from './router/AppRouter.jsx'

export default function App() {
  return (
    <ToastProvider>
      <RoleProvider>
        <AppRouter />
      </RoleProvider>
    </ToastProvider>
  )
}
