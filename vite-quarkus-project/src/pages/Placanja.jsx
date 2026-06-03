/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { useEffect, useMemo, useState } from 'react'
import { BellRing, CheckCircle2, Pencil } from 'lucide-react'
import { obavjestenjaApi } from '../api/obavjestenjaApi.js'
import { placanjaApi } from '../api/placanjaApi.js'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockPlacanja } from '../data/mockData.js'
import { date, fullName, money, statusVariant } from '../utils/formatters.js'

export default function Placanja() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingId, setSendingId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        setItems(await placanjaApi.list())
      } catch {
        setItems(mockPlacanja)
        setError('API za plaćanja još nije spreman. Prikazani su demo podaci.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [fullName(item.stanar), item.stan?.brojStana, item.mjesec, item.status].join(' ').toLowerCase().includes(query))
  }, [items, search])

  const paid = items.filter((item) => item.status === 'Plaćeno').reduce((sum, item) => sum + Number(item.iznos || 0), 0)
  const unpaid = items.filter((item) => item.status !== 'Plaćeno')

  async function sendReminder(row) {
    setSendingId(row.id)
    const stanar = row.stanar
    const payload = {
      naslov: 'Podsjetnik za mjesečno održavanje',
      tekst: `Poštovani/a ${fullName(stanar)}, evidentirano je da mjesečno održavanje za ${row.mjesec} još nije uplaćeno. Molimo vas da izmirite obavezu kako bi ulaz mogao redovno da funkcioniše i održava zajedničke prostorije.`,
      tip: 'PRIVATE',
      stanarIds: stanar?.id ? [stanar.id] : [],
      senderId: null,
    }
    try {
      await obavjestenjaApi.send(payload)
      showToast('Podsjetnik je poslat stanaru.')
    } catch {
      showToast('Podsjetnik je evidentiran lokalno jer API nije dostupan.', 'info')
    } finally {
      setSendingId(null)
    }
  }

  const columns = [
    { key: 'stanar', header: 'Stanar', render: (row) => fullName(row.stanar) },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'mjesec', header: 'Mjesec' },
    { key: 'iznos', header: 'Iznos', render: (row) => money(row.iznos) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
    { key: 'datumUplate', header: 'Datum uplate', render: (row) => date(row.datumUplate) },
    {
      key: 'actions',
      header: 'Akcije',
      align: 'right',
      render: (row) => (
        <div className="row-actions">
          {row.status !== 'Plaćeno' ? (
            <Button variant="secondary" size="sm" icon={BellRing} loading={sendingId === row.id} onClick={() => sendReminder(row)}>Podsjeti</Button>
          ) : (
            <Button variant="secondary" size="sm" icon={CheckCircle2}>Plaćeno</Button>
          )}
          <Button variant="secondary" size="sm" icon={Pencil}>Izmijeni</Button>
        </div>
      ),
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Plaćanja" subtitle="Pregled mjesečnog održavanja, uplata i statusa po stanaru." />
      <ErrorMessage message={error} />
      <div className="stats-grid">
        <StatCard icon={CheckCircle2} label="Naplaćeno" value={money(paid)} trend="Ovaj mjesec" tone="success" />
        <StatCard icon={BellRing} label="Nije plaćeno" value={unpaid.length} trend="Stanovi za podsjetnik" tone="warning" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži plaćanja..." />
      </div>
      <DataTable columns={columns} data={filteredItems} loading={loading} emptyTitle="Nema uplata" emptyDescription="Kada unesete mjesečne obaveze, statusi uplata će biti prikazani ovdje." />
    </section>
  )
}

