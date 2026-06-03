import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Dashboard from '../pages/Dashboard.jsx'
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
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
