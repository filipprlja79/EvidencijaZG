/*
 * Komentar projekta: Layout komponenta koja gradi osnovni raspored aplikacije, navigaciju i gornju traku.
 */

import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useRole } from '../../context/RoleContext.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const roleRoutes = {
  admin: ['/dashboard', '/zgrade', '/ulazi', '/stanovi', '/stanari', '/obavjestenja', '/placanja', '/dugovanja', '/odrzavanje', '/dokumenti', '/prekrsaji', '/izvjestaji', '/podesavanja', '/'],
  starjesina: ['/dashboard', '/ulazi', '/stanovi', '/stanari', '/obavjestenja', '/placanja', '/dugovanja', '/odrzavanje', '/dokumenti', '/prekrsaji', '/izvjestaji', '/podesavanja', '/'],
  stanar: ['/dashboard', '/obavjestenja', '/placanja', '/dugovanja', '/odrzavanje', '/dokumenti', '/podesavanja', '/'],
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { role } = useRole()
  const location = useLocation()
  const navigate = useNavigate()

  if (!roleRoutes[role].includes(location.pathname)) {
    queueMicrotask(() => navigate('/dashboard', { replace: true }))
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} search={search} onSearchChange={setSearch} />
        <main className="content-area">
          <Outlet context={{ globalSearch: search, role }} />
        </main>
      </div>
    </div>
  )
}

