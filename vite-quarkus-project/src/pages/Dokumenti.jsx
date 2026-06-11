/*
 * Komentar projekta: Page komponenta za demo biblioteku dokumenata.
 */

import { useMemo, useState } from 'react'
import { Download, FileText, Plus } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockDokumenti } from '../data/mockData.js'
import { date } from '../utils/formatters.js'

export default function Dokumenti() {
  const { showToast } = useToast()
  const [items, setItems] = useState(mockDokumenti)
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [item.naziv, item.kategorija].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function addDocument() {
    const next = {
      id: Math.max(0, ...items.map((item) => item.id)) + 1,
      naziv: `Demo dokument ${items.length + 1}`,
      kategorija: 'Demo',
      datum: new Date().toISOString().slice(0, 10),
      dostupnoStanaru: true,
    }
    setItems((current) => [next, ...current])
    showToast('Dokument je dodat lokalno za prezentaciju.')
  }

  function downloadDocument(row) {
    const content = `Dokument: ${row.naziv}\nKategorija: ${row.kategorija}\nDatum: ${row.datum}\n`
    const url = window.URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${row.naziv.replaceAll(' ', '-').toLowerCase()}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    showToast('Dokument je preuzet.')
  }

  const columns = [
    { key: 'naziv', header: 'Naziv dokumenta' },
    { key: 'kategorija', header: 'Kategorija' },
    { key: 'datum', header: 'Datum', render: (row) => date(row.datum) },
    { key: 'dostupnoStanaru', header: 'Portal stanara', render: (row) => <Badge variant={row.dostupnoStanaru ? 'success' : 'neutral'}>{row.dostupnoStanaru ? 'Vidljivo' : 'Interno'}</Badge> },
    { key: 'actions', header: 'Akcije', align: 'right', render: (row) => <Button variant="secondary" size="sm" icon={Download} onClick={() => downloadDocument(row)}>Preuzmi</Button> },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Dokumenti" subtitle="Biblioteka pravila, zapisnika, ugovora i dokumenata dostupnih stanarima." actions={<Button icon={Plus} onClick={addDocument}>Dodaj dokument</Button>} />
      <div className="stats-grid">
        <StatCard icon={FileText} label="Ukupno dokumenata" value={items.length} trend="Centralna evidencija" tone="info" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretrazi dokumente..." />
      </div>
      <DataTable columns={columns} data={filteredItems} emptyTitle="Nema dokumenata" emptyDescription="Dodajte kucni red, zapisnike i ugovore za profesionalan portal stanara." />
    </section>
  )
}
