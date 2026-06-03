/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { useMemo, useState } from 'react'
import { Download, FileText, Plus } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { mockDokumenti } from '../data/mockData.js'
import { date } from '../utils/formatters.js'

export default function Dokumenti() {
  const [search, setSearch] = useState('')
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return mockDokumenti.filter((item) => !query || [item.naziv, item.kategorija].join(' ').toLowerCase().includes(query))
  }, [search])

  const columns = [
    { key: 'naziv', header: 'Naziv dokumenta' },
    { key: 'kategorija', header: 'Kategorija' },
    { key: 'datum', header: 'Datum', render: (row) => date(row.datum) },
    { key: 'dostupnoStanaru', header: 'Portal stanara', render: (row) => <Badge variant={row.dostupnoStanaru ? 'success' : 'neutral'}>{row.dostupnoStanaru ? 'Vidljivo' : 'Interno'}</Badge> },
    { key: 'actions', header: 'Akcije', align: 'right', render: () => <Button variant="secondary" size="sm" icon={Download}>Preuzmi</Button> },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Dokumenti" subtitle="Biblioteka pravila, zapisnika, ugovora i dokumenata dostupnih stanarima." actions={<Button icon={Plus}>Dodaj dokument</Button>} />
      <div className="stats-grid">
        <StatCard icon={FileText} label="Ukupno dokumenata" value={mockDokumenti.length} trend="Centralna evidencija" tone="info" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži dokumente..." />
      </div>
      <DataTable columns={columns} data={filteredItems} emptyTitle="Nema dokumenata" emptyDescription="Dodajte kućni red, zapisnike i ugovore za profesionalan portal stanara." />
    </section>
  )
}

