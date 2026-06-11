/*
 * Komentar projekta: Layout komponenta koja gradi osnovni raspored aplikacije, navigaciju i gornju traku.
 */

import { Bell, LogOut, Menu, Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import Button from '../ui/Button.jsx'
import SearchInput from '../ui/SearchInput.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useState } from 'react'

const breadcrumbLabels = {
  '/dashboard': 'Dashboard',
  '/zgrade': 'Zgrade',
  '/ulazi': 'Ulazi',
  '/stanovi': 'Stanovi',
  '/stanari': 'Stanari',
  '/obavjestenja': 'Obavještenja',
  '/placanja': 'Plaćanja',
  '/dugovanja': 'Dugovanja',
  '/odrzavanje': 'Održavanje',
  '/dokumenti': 'Dokumenti',
  '/prekrsaji': 'Pravila',
  '/izvjestaji': 'Izvještaji',
  '/podesavanja': 'Podešavanja',
  '/': 'Dashboard',
}

export default function Topbar({ onMenuClick, search, onSearchChange }) {
  const [switchingRole, setSwitchingRole] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { role, roles, setRole } = useRole()
  const { logout, profile, switchDemoRole } = useAuth()
  const { showToast } = useToast()
  const current = breadcrumbLabels[location.pathname] || 'Dashboard'
  const initials = profile ? `${profile.ime?.[0] || ''}${profile.prezime?.[0] || ''}`.toUpperCase() : roles.find((item) => item.value === role)?.initials

  async function handleRoleChange(event) {
    const nextRole = event.target.value
    setSwitchingRole(true)
    try {
      await switchDemoRole(nextRole)
      setRole(nextRole)
      navigate('/dashboard', { replace: true })
      showToast(`Prebaceni ste na ulogu: ${roles.find((item) => item.value === nextRole)?.label || nextRole}.`)
    } catch (err) {
      showToast(err?.message || 'Promjena uloge nije uspjela.', 'error')
    } finally {
      setSwitchingRole(false)
    }
  }

  return (
    <header className="topbar">
      <Button variant="ghost" size="icon" className="mobile-menu-button" aria-label="Otvori meni" icon={Menu} onClick={onMenuClick} />
      <div className="breadcrumb">Dashboard / <strong>{current}</strong></div>
      <SearchInput value={search} onChange={onSearchChange} placeholder="Pretraži zgrade, stanare, stanove..." className="topbar-search" />
      <div className="topbar-actions">
        <label className="role-select" aria-label="Odaberi ulogu">
          <span>Uloga</span>
          <select value={role} onChange={handleRoleChange} disabled={switchingRole}>
            {roles.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <Button icon={Plus}>Dodaj</Button>
        <button className="icon-button" aria-label="Notifikacije"><Bell size={18} /></button>
        <button
          className="icon-button"
          aria-label="Odjavi se"
          title="Odjavi se"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          <LogOut size={18} />
        </button>
        <div className="avatar">{initials || 'BM'}</div>
      </div>
    </header>
  )
}

