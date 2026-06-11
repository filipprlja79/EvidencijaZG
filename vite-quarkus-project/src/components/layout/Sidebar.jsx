/*
 * Komentar projekta: Layout komponenta koja gradi osnovni raspored aplikacije, navigaciju i gornju traku.
 */

import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  Gauge,
  Home,
  MessageSquare,
  ShieldAlert,
  Wrench,
  BarChart3,
  ReceiptText,
  Settings,
  Users,
  WalletCards,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useRole } from '../../context/RoleContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge, roles: ['admin', 'starjesina', 'stanar'] },
  { to: '/zgrade', label: 'Zgrade', icon: Building2, roles: ['admin'] },
  { to: '/ulazi', label: 'Ulazi', icon: Home, roles: ['admin', 'starjesina'] },
  { to: '/stanovi', label: 'Stanovi', icon: WalletCards, roles: ['admin', 'starjesina'] },
  { to: '/stanari', label: 'Stanari', icon: Users, roles: ['admin', 'starjesina'] },
  { to: '/obavjestenja', label: 'Obavještenja', icon: MessageSquare, roles: ['admin', 'starjesina', 'stanar'] },
  { to: '/placanja', label: 'Plaćanja', icon: CreditCard, roles: ['admin', 'starjesina', 'stanar'] },
  { to: '/dugovanja', label: 'Dugovanja', icon: ReceiptText, roles: ['admin', 'starjesina', 'stanar'] },
  { to: '/odrzavanje', label: 'Održavanje', icon: Wrench, roles: ['admin', 'starjesina', 'stanar'] },
  { to: '/dokumenti', label: 'Dokumenti', icon: FileText, roles: ['admin', 'starjesina', 'stanar'] },
  { to: '/prekrsaji', label: 'Pravila', icon: ShieldAlert, roles: ['admin', 'starjesina'] },
  { to: '/izvjestaji', label: 'Izvještaji', icon: BarChart3, roles: ['admin', 'starjesina'] },
  { to: '/podesavanja', label: 'Podešavanja', icon: Settings, roles: ['admin', 'starjesina', 'stanar'] },
]

export default function Sidebar({ open, onClose }) {
  const { role, activeRole } = useRole()
  const { profile } = useAuth()
  const visibleNavItems = navItems.filter((item) => item.roles.includes(role))
  const fullName = profile ? `${profile.ime || ''} ${profile.prezime || ''}`.trim() : activeRole.label

  return (
    <>
      <button className={`sidebar-backdrop ${open ? 'show' : ''}`} aria-label="Zatvori meni" onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div><Bell size={22} /></div>
          <span>Building Manager</span>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{activeRole.initials}</div>
          <div>
            <strong>{fullName || activeRole.label}</strong>
            <span>{activeRole.description}</span>
          </div>
        </div>
      </aside>
    </>
  )
}

