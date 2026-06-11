/*
 * Komentar projekta: Page komponenta za pregled i demo izmjenu placanja.
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
import { useRole } from '../context/RoleContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockPlacanja } from '../data/mockData.js'
import { date, fullName, money, statusVariant } from '../utils/formatters.js'

export default function Placanja() {
  const { showToast } = useToast()
  const { role } = useRole()
  const canSendReminder = role === 'admin' || role === 'starjesina'
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
        setError('API za placanja jos nije spreman. Prikazani su demo podaci.')
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

  const paid = items.filter((item) => item.status === 'Placeno').reduce((sum, item) => sum + Number(item.iznos || 0), 0)
  const unpaid = items.filter((item) => item.status !== 'Placeno')

  async function sendReminder(row) {
    if (!canSendReminder) {
      showToast('Samo admin i starjesina mogu slati podsjetnike.', 'warning')
      return
    }

    setSendingId(row.id)
    const stanar = row.stanar
    const payload = {
      naslov: 'Podsjetnik za mjesecno odrzavanje',
      tekst: `Postovani/a ${fullName(stanar)}, evidentirano je da mjesecno odrzavanje za ${row.mjesec} jos nije uplaceno.`,
      tip: 'PRIVATE',
      stanarIds: stanar?.id ? [stanar.id] : [],
      senderId: null,
    }
    try {
      await obavjestenjaApi.send(payload)
      showToast('Podsjetnik je poslat stanaru.')
    } catch {
      showToast('Podsjetnik je evidentiran lokalno za prezentaciju.', 'info')
    } finally {
      setSendingId(null)
    }
  }

  function togglePaymentStatus(row) {
    const paidStatuses = ['Placeno', 'PlaÄ‡eno']
    const nextStatus = paidStatuses.includes(row.status) ? 'Nije placeno' : 'Placeno'
    setItems((current) => current.map((item) => (
      item.id === row.id
        ? { ...item, status: nextStatus, datumUplate: nextStatus === 'Placeno' ? new Date().toISOString().slice(0, 10) : null }
        : item
    )))
    showToast(`Status placanja je promijenjen u: ${nextStatus}.`)
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
          {row.status !== 'Placeno' && row.status !== 'PlaÄ‡eno' ? (
            <Button variant="secondary" size="sm" icon={BellRing} loading={sendingId === row.id} onClick={() => sendReminder(row)}>Podsjeti</Button>
          ) : (
            <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => togglePaymentStatus(row)}>Placeno</Button>
          )}
          <Button variant="secondary" size="sm" icon={Pencil} onClick={() => togglePaymentStatus(row)}>Izmijeni</Button>
        </div>
      ),
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Placanja" subtitle="Pregled mjesecnog odrzavanja, uplata i statusa po stanaru." />
      <ErrorMessage message={error} />
      <div className="stats-grid">
        <StatCard icon={CheckCircle2} label="Naplaceno" value={money(paid)} trend="Ovaj mjesec" tone="success" />
        <StatCard icon={BellRing} label="Nije placeno" value={unpaid.length} trend="Stanovi za podsjetnik" tone="warning" />
      </div>
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretrazi placanja..." />
      </div>
      <DataTable columns={columns} data={filteredItems} loading={loading} emptyTitle="Nema uplata" emptyDescription="Kada unesete mjesecne obaveze, statusi uplata ce biti prikazani ovdje." />
    </section>
  )
}
