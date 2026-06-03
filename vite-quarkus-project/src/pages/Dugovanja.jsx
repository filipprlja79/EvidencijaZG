import { useEffect, useMemo, useState } from 'react'
import { BellRing, Euro, Users } from 'lucide-react'
import { dugovanjaApi } from '../api/dugovanjaApi.js'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { mockDugovanja } from '../data/mockData.js'
import { date, fullName, money } from '../utils/formatters.js'

export default function Dugovanja() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        setItems(await dugovanjaApi.list())
      } catch {
        setItems(mockDugovanja)
        setError('API za dugovanja još nije spreman. Prikazani su demo podaci.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [fullName(item.stanar), item.stan?.brojStana, item.ukupanDug].join(' ').toLowerCase().includes(query))
  }, [items, search])

  const totalDebt = items.reduce((sum, item) => sum + Number(item.ukupanDug || 0), 0)
  const columns = [
    { key: 'stanar', header: 'Stanar', render: (row) => fullName(row.stanar) },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'ukupanDug', header: 'Ukupan dug', render: (row) => money(row.ukupanDug) },
    { key: 'neplaceniMjeseci', header: 'Broj neplaćenih mjeseci' },
    { key: 'zadnjaUplata', header: 'Zadnja uplata', render: (row) => date(row.zadnjaUplata) },
    { key: 'actions', header: 'Akcije', align: 'right', render: () => <Button variant="secondary" size="sm" icon={BellRing}>Podsjeti</Button> },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Dugovanja" subtitle="Pregled stanara sa dugom i istorijom neplaćenih mjeseci." />
      <ErrorMessage message={error} />
      <div className="stats-grid">
        <StatCard icon={Euro} label="Ukupan dug" value={money(totalDebt)} trend="Za sve evidentirane stanare" tone="warning" />
        <StatCard icon={Users} label="Stanari sa dugom" value={items.length} trend="Prioritet naplate" tone="info" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži dugovanja..." />
      </div>
      <DataTable columns={columns} data={filteredItems} loading={loading} emptyTitle="Nema dugovanja" emptyDescription="Trenutno nema evidentiranih dugovanja." />
    </section>
  )
}
