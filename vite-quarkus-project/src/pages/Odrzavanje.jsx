/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Plus, Wrench } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { mockOdrzavanje } from '../data/mockData.js'
import { date, fullName, statusVariant } from '../utils/formatters.js'

export default function Odrzavanje() {
  const [search, setSearch] = useState('')
  const items = mockOdrzavanje
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [item.naslov, item.status, item.prioritet, fullName(item.prijavio)].join(' ').toLowerCase().includes(query))
  }, [items, search])

  const columns = [
    { key: 'naslov', header: 'Zahtjev' },
    { key: 'prijavio', header: 'Prijavio', render: (row) => fullName(row.prijavio) },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'prioritet', header: 'Prioritet', render: (row) => <Badge variant={row.prioritet === 'Visok' ? 'danger' : 'warning'}>{row.prioritet}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Otvoren' ? 'info' : 'warning'}>{row.status}</Badge> },
    { key: 'datum', header: 'Datum', render: (row) => date(row.datum) },
    { key: 'actions', header: 'Akcije', align: 'right', render: () => <Button variant="secondary" size="sm" icon={CheckCircle2}>Zatvori</Button> },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Održavanje" subtitle="Ticketi, kvarovi i radni nalozi za ulaze i stanove." actions={<Button icon={Plus}>Novi zahtjev</Button>} />
      <div className="stats-grid">
        <StatCard icon={Wrench} label="Otvoreni zahtjevi" value={items.filter((item) => item.status === 'Otvoren').length} trend="Potrebna reakcija" tone="warning" />
        <StatCard icon={Clock} label="U toku" value={items.filter((item) => item.status === 'U toku').length} trend="Dodijeljeno izvođaču" tone="info" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži održavanje..." />
      </div>
      <DataTable columns={columns} data={filteredItems} emptyTitle="Nema zahtjeva za održavanje" emptyDescription="Stanari će ovdje prijavljivati kvarove i pratiti status." />
    </section>
  )
}

