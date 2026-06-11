/*
 * Komentar projekta: Router konfiguracija koja povezuje URL putanje sa React stranicama.
 */

import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Zgrade from '../pages/Zgrade.jsx'
import Ulazi from '../pages/Ulazi.jsx'
import Stanovi from '../pages/Stanovi.jsx'
import Stanari from '../pages/Stanari.jsx'
import Obavjestenja from '../pages/Obavjestenja.jsx'
import Placanja from '../pages/Placanja.jsx'
import Dugovanja from '../pages/Dugovanja.jsx'
import Odrzavanje from '../pages/Odrzavanje.jsx'
import Dokumenti from '../pages/Dokumenti.jsx'
import Prekrsaji from '../pages/Prekrsaji.jsx'
import Izvjestaji from '../pages/Izvjestaji.jsx'
import Settings from '../pages/Settings.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/zgrade" element={<Zgrade />} />
          <Route path="/ulazi" element={<Ulazi />} />
          <Route path="/stanovi" element={<Stanovi />} />
          <Route path="/stanari" element={<Stanari />} />
          <Route path="/obavjestenja" element={<Obavjestenja />} />
          <Route path="/placanja" element={<Placanja />} />
          <Route path="/dugovanja" element={<Dugovanja />} />
          <Route path="/odrzavanje" element={<Odrzavanje />} />
          <Route path="/dokumenti" element={<Dokumenti />} />
          <Route path="/prekrsaji" element={<Prekrsaji />} />
          <Route path="/izvjestaji" element={<Izvjestaji />} />
          <Route path="/podesavanja" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

