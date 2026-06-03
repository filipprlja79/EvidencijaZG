/*
 * Komentar projekta: Layout komponenta koja gradi osnovni raspored aplikacije, navigaciju i gornju traku.
 */

import { Bell, Menu, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useRole } from '../../context/RoleContext.jsx'
import Button from '../ui/Button.jsx'
import SearchInput from '../ui/SearchInput.jsx'

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
  const location = useLocation()
  const { role, roles, setRole } = useRole()
  const current = breadcrumbLabels[location.pathname] || 'Dashboard'

  return (
    <header className="topbar">
      <Button variant="ghost" size="icon" className="mobile-menu-button" aria-label="Otvori meni" icon={Menu} onClick={onMenuClick} />
      <div className="breadcrumb">Dashboard / <strong>{current}</strong></div>
      <SearchInput value={search} onChange={onSearchChange} placeholder="Pretraži zgrade, stanare, stanove..." className="topbar-search" />
      <div className="topbar-actions">
        <label className="role-select" aria-label="Odaberi ulogu">
          <span>Uloga</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {roles.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <Button icon={Plus}>Dodaj</Button>
        <button className="icon-button" aria-label="Notifikacije"><Bell size={18} /></button>
        <div className="avatar">{roles.find((item) => item.value === role)?.initials || 'BM'}</div>
      </div>
    </header>
  )
}

