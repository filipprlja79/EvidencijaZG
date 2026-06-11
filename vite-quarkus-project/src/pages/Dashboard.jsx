/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { useEffect, useState } from 'react'
import { Building2, CreditCard, DoorOpen, Home, TrendingUp, Users } from 'lucide-react'
import { dugovanjaApi } from '../api/dugovanjaApi.js'
import { obavjestenjaApi } from '../api/obavjestenjaApi.js'
import { placanjaApi } from '../api/placanjaApi.js'
import { stanariApi } from '../api/stanariApi.js'
import { stanoviApi } from '../api/stanoviApi.js'
import { ulaziApi } from '../api/ulaziApi.js'
import { zgradeApi } from '../api/zgradeApi.js'
import Badge from '../components/ui/Badge.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import {
  mockDugovanja,
  mockObavjestenja,
  mockPlacanja,
  mockStanari,
  mockStanovi,
  mockUlazi,
  mockZgrade,
} from '../data/mockData.js'
import { date, fullName, money, statusVariant } from '../utils/formatters.js'

const chartData = [
  { label: 'Jan', value: 62 },
  { label: 'Feb', value: 74 },
  { label: 'Mar', value: 68 },
  { label: 'Apr', value: 82 },
  { label: 'Maj', value: 91 },
  { label: 'Jun', value: 77 },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const { role } = useRole()
  const [state, setState] = useState({
    zgrade: [],
    ulazi: [],
    stanovi: [],
    stanari: [],
    obavjestenja: [],
    placanja: [],
    dugovanja: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const canManageBuilding = role === 'admin' || role === 'starjesina'
      const canListZgrade = role === 'admin'
      const ulazId = profile?.ulazId
      const stanarId = profile?.id

      const results = await Promise.allSettled([
        canListZgrade ? zgradeApi.list() : Promise.resolve([]),
        canManageBuilding ? ulaziApi.list() : Promise.resolve(ulazId ? [{ id: ulazId, nazivUlaza: profile?.ulazNaziv, brojUlaza: profile?.brojUlaza }] : []),
        canManageBuilding ? stanoviApi.list() : ulazId ? stanoviApi.listByUlaz(ulazId) : Promise.resolve([]),
        canManageBuilding ? stanariApi.list() : ulazId ? stanariApi.listByUlaz(ulazId) : Promise.resolve([]),
        canManageBuilding ? obavjestenjaApi.list() : stanarId ? obavjestenjaApi.listMine(stanarId) : Promise.resolve([]),
        placanjaApi.list(),
        dugovanjaApi.list(),
      ])

      if (!mounted) return

      const hasServerError = results.slice(0, 5).some((result) => result.status === 'rejected')
      setError(hasServerError ? ' Prikazani su dostupni ili demo podaci.' : '')
      setState({
        zgrade: results[0].status === 'fulfilled' ? results[0].value : mockZgrade,
        ulazi: results[1].status === 'fulfilled' ? results[1].value : mockUlazi,
        stanovi: results[2].status === 'fulfilled' ? results[2].value : mockStanovi,
        stanari: results[3].status === 'fulfilled' ? results[3].value : mockStanari,
        obavjestenja: results[4].status === 'fulfilled' ? results[4].value : mockObavjestenja,
        placanja: results[5].status === 'fulfilled' ? results[5].value : mockPlacanja,
        dugovanja: results[6].status === 'fulfilled' ? results[6].value : mockDugovanja,
      })
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [profile, role])

  const totalDebt = state.dugovanja.reduce((sum, item) => sum + Number(item.ukupanDug || 0), 0)
  const paidThisMonth = state.placanja
    .filter((item) => item.status === 'Plaćeno')
    .reduce((sum, item) => sum + Number(item.iznos || 0), 0)

  const debtColumns = [
    { key: 'stanar', header: 'Stanar', render: (row) => fullName(row.stanar) },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'ukupanDug', header: 'Ukupan dug', render: (row) => money(row.ukupanDug) },
    { key: 'neplaceniMjeseci', header: 'Neplaćeni mjeseci' },
    { key: 'zadnjaUplata', header: 'Zadnja uplata', render: (row) => date(row.zadnjaUplata) },
  ]

  return (
    <section className="page-stack">
      <PageHeader
        title="Dashboard"
        subtitle="Pregled stanja zgrada, stanova, stanara i obaveza."
      />

      <ErrorMessage message={error} />

      <div className="stats-grid">
        <StatCard icon={Building2} label="Ukupno zgrada" value={loading ? '-' : state.zgrade.length} trend="+12% u odnosu na prošli mjesec" />
        <StatCard icon={DoorOpen} label="Ukupno ulaza" value={loading ? '-' : state.ulazi.length} trend="+4 nova ulaza" tone="info" />
        <StatCard icon={Home} label="Ukupno stanova" value={loading ? '-' : state.stanovi.length} trend="+8% rast evidencije" tone="success" />
        <StatCard icon={Users} label="Ukupno stanara" value={loading ? '-' : state.stanari.length} trend="+6 novih stanara" />
        <StatCard icon={TrendingUp} label="Ukupan dug" value={loading ? '-' : money(totalDebt)} trend="Prioritet za naplatu" tone="warning" />
        <StatCard icon={CreditCard} label="Naplaćeno ovog mjeseca" value={loading ? '-' : money(paidThisMonth)} trend="+18% u odnosu na april" tone="success" />
      </div>

      <div className="dashboard-grid">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Mjesečna naplata</h2>
            <Badge variant="info">2026</Badge>
          </div>
          <div className="chart-bars">
            {chartData.map((item) => (
              <div className="chart-bar" key={item.label}>
                <div style={{ height: `${item.value}%` }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Najnovija obavještenja</h2>
            <Badge variant="success">Aktivno</Badge>
          </div>
          <div className="notice-list">
            {state.obavjestenja.slice(0, 3).map((item) => (
              <article className="notice-card" key={item.id}>
                <h3>{item.naslov}</h3>
                <p>{item.tekst}</p>
                <div className="notice-meta">
                  <Badge variant={statusVariant(item.status || 'Aktivno')}>{item.status || 'Aktivno'}</Badge>
                  <span>{date(item.kreiranoAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="wide">
          <div className="panel-header" style={{ marginBottom: 12 }}>
            <h2>Stanari sa najvećim dugovanjem</h2>
          </div>
          <DataTable columns={debtColumns} data={state.dugovanja} loading={loading} />
        </div>
      </div>
    </section>
  )
}

