import { useMemo, useState } from 'react'
import { Plus, ShieldAlert } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { mockPrekrsaji } from '../data/mockData.js'
import { date, fullName } from '../utils/formatters.js'

export default function Prekrsaji() {
  const [search, setSearch] = useState('')
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return mockPrekrsaji.filter((item) => !query || [fullName(item.stanar), item.pravilo, item.status].join(' ').toLowerCase().includes(query))
  }, [search])

  const columns = [
    { key: 'stanar', header: 'Stanar', render: (row) => fullName(row.stanar) },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'pravilo', header: 'Pravilo' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Riješeno' ? 'success' : 'warning'}>{row.status}</Badge> },
    { key: 'datum', header: 'Datum', render: (row) => date(row.datum) },
    { key: 'napomena', header: 'Napomena' },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Pravila i prekršaji" subtitle="Evidencija kršenja kućnog reda, upozorenja i statusa rješavanja." actions={<Button icon={Plus}>Dodaj slučaj</Button>} />
      <div className="stats-grid">
        <StatCard icon={ShieldAlert} label="Otvoreni slučajevi" value={mockPrekrsaji.filter((item) => item.status !== 'Riješeno').length} trend="Za praćenje" tone="warning" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži pravila..." />
      </div>
      <DataTable columns={columns} data={filteredItems} emptyTitle="Nema prekršaja" emptyDescription="Kada starješina evidentira kršenje pravila, slučajevi će biti prikazani ovdje." />
    </section>
  )
}
