/*
 * Komentar projekta: Page komponenta za demo odrzavanje.
 */

import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Plus, Wrench } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockOdrzavanje } from '../data/mockData.js'
import { date, fullName } from '../utils/formatters.js'

export default function Odrzavanje() {
  const { showToast } = useToast()
  const [items, setItems] = useState(mockOdrzavanje)
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [item.naslov, item.status, item.prioritet, fullName(item.prijavio)].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function addTicket() {
    const next = {
      id: Math.max(0, ...items.map((item) => item.id)) + 1,
      naslov: `Novi zahtjev ${items.length + 1}`,
      prioritet: 'Srednji',
      status: 'Otvoren',
      prijavio: null,
      stan: null,
      datum: new Date().toISOString().slice(0, 10),
      opis: 'Demo zahtjev dodat lokalno.',
    }
    setItems((current) => [next, ...current])
    showToast('Zahtjev je dodat lokalno za prezentaciju.')
  }

  function closeTicket(row) {
    setItems((current) => current.map((item) => (item.id === row.id ? { ...item, status: 'Rijeseno' } : item)))
    showToast('Zahtjev je zatvoren.')
  }

  const columns = [
    { key: 'naslov', header: 'Zahtjev' },
    { key: 'prijavio', header: 'Prijavio', render: (row) => fullName(row.prijavio) },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'prioritet', header: 'Prioritet', render: (row) => <Badge variant={row.prioritet === 'Visok' ? 'danger' : 'warning'}>{row.prioritet}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Otvoren' ? 'info' : row.status === 'Rijeseno' ? 'success' : 'warning'}>{row.status}</Badge> },
    { key: 'datum', header: 'Datum', render: (row) => date(row.datum) },
    { key: 'actions', header: 'Akcije', align: 'right', render: (row) => <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => closeTicket(row)}>Zatvori</Button> },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Odrzavanje" subtitle="Ticketi, kvarovi i radni nalozi za ulaze i stanove." actions={<Button icon={Plus} onClick={addTicket}>Novi zahtjev</Button>} />
      <div className="stats-grid">
        <StatCard icon={Wrench} label="Otvoreni zahtjevi" value={items.filter((item) => item.status === 'Otvoren').length} trend="Potrebna reakcija" tone="warning" />
        <StatCard icon={Clock} label="U toku" value={items.filter((item) => item.status === 'U toku').length} trend="Dodijeljeno izvodjacu" tone="info" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretrazi odrzavanje..." />
      </div>
      <DataTable columns={columns} data={filteredItems} emptyTitle="Nema zahtjeva za odrzavanje" emptyDescription="Stanari ce ovdje prijavljivati kvarove i pratiti status." />
    </section>
  )
}
