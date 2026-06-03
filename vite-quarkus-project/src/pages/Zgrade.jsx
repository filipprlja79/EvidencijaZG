import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { ulaziApi } from '../api/ulaziApi.js'
import { zgradeApi } from '../api/zgradeApi.js'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import FormInput from '../components/forms/FormInput.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockStanovi, mockUlazi, mockZgrade } from '../data/mockData.js'
import { nextLocalId } from '../utils/formatters.js'
import { stanoviApi } from '../api/stanoviApi.js'

const initialForm = { naziv: '', vlasnik: '', grad: '', naselje: '' }

export default function Zgrade() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [ulazi, setUlazi] = useState([])
  const [stanovi, setStanovi] = useState([])
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [zgradeResult, ulaziResult, stanoviResult] = await Promise.allSettled([
        zgradeApi.list(),
        ulaziApi.list(),
        stanoviApi.list(),
      ])
      setItems(zgradeResult.status === 'fulfilled' ? zgradeResult.value : mockZgrade)
      setUlazi(ulaziResult.status === 'fulfilled' ? ulaziResult.value : mockUlazi)
      setStanovi(stanoviResult.status === 'fulfilled' ? stanoviResult.value : mockStanovi)
      setError(zgradeResult.status === 'rejected' ? 'API nije dostupan za zgrade. Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [])

  const cities = useMemo(() => [...new Set(items.map((item) => item.grad).filter(Boolean))], [items])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch = !query || [item.naziv, item.vlasnik, item.grad, item.naselje].join(' ').toLowerCase().includes(query)
      const matchesCity = !city || item.grad === city
      return matchesSearch && matchesCity
    })
  }, [items, search, city])

  function openCreate() {
    setEditing(null)
    setForm(initialForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      naziv: item.naziv || '',
      vlasnik: item.vlasnik || '',
      grad: item.grad || '',
      naselje: item.naselje || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const nextErrors = {}
    if (!form.naziv.trim()) nextErrors.naziv = 'Naziv zgrade je obavezan.'
    if (!form.vlasnik.trim()) nextErrors.vlasnik = 'Vlasnik je obavezan.'
    if (!form.grad.trim()) nextErrors.grad = 'Grad je obavezan.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function save() {
    if (!validate()) return

    setSaving(true)
    try {
      const payload = { ...form }
      const saved = editing
        ? await zgradeApi.update(editing.id, payload)
        : await zgradeApi.create(payload)
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? { ...item, ...saved } : item))
        : [...current, saved])
      showToast('Uspješno sačuvano.')
    } catch {
      const localItem = { id: editing?.id || nextLocalId(items), ...form }
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? localItem : item))
        : [...current, localItem])
      showToast('Sačuvano lokalno jer API nije dostupan.', 'info')
    } finally {
      setSaving(false)
      setModalOpen(false)
    }
  }

  async function remove() {
    if (!confirm) return
    setSaving(true)
    try {
      await zgradeApi.remove(confirm.id)
      showToast('Uspješno obrisano.')
    } catch {
      showToast('Obrisano lokalno jer API nije dostupan.', 'info')
    } finally {
      setItems((current) => current.filter((item) => item.id !== confirm.id))
      setSaving(false)
      setConfirm(null)
    }
  }

  const columns = [
    { key: 'naziv', header: 'Naziv' },
    { key: 'vlasnik', header: 'Vlasnik' },
    { key: 'grad', header: 'Grad' },
    {
      key: 'brojUlaza',
      header: 'Broj ulaza',
      render: (row) => ulazi.filter((ulaz) => ulaz.zgrada?.id === row.id).length,
    },
    {
      key: 'brojStanova',
      header: 'Broj stanova',
      render: (row) => stanovi.filter((stan) => stan.ulaz?.zgrada?.id === row.id).length,
    },
    {
      key: 'actions',
      header: 'Akcije',
      align: 'right',
      render: (row) => (
        <div className="row-actions">
          <Button variant="secondary" size="sm" icon={Eye}>Pogledaj</Button>
          <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(row)}>Izmijeni</Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirm(row)}>Obriši</Button>
        </div>
      ),
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader
        title="Zgrade"
        subtitle="Upravljanje zgradama, vlasnicima i lokacijama."
        actions={<Button icon={Plus} onClick={openCreate}>Dodaj zgradu</Button>}
      />
      <ErrorMessage message={error} />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži zgrade..." />
        <select className="filter-select" value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">Svi gradovi</option>
          {cities.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyTitle="Nema unesenih zgrada"
        emptyDescription="Dodajte prvu zgradu kako biste počeli sa upravljanjem ulazima, stanovima i stanarima."
        emptyAction={<Button icon={Plus} onClick={openCreate}>Dodaj zgradu</Button>}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Izmijeni zgradu' : 'Dodaj zgradu'}
        description="Unesite osnovne podatke o zgradi."
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Odustani</Button>
            <Button loading={saving} onClick={save}>Sačuvaj</Button>
          </>
        )}
      >
        <div className="form-grid">
          <FormInput label="Naziv zgrade" value={form.naziv} error={errors.naziv} onChange={(event) => setForm({ ...form, naziv: event.target.value })} />
          <FormInput label="Vlasnik" value={form.vlasnik} error={errors.vlasnik} onChange={(event) => setForm({ ...form, vlasnik: event.target.value })} />
          <div className="form-grid two">
            <FormInput label="Grad" value={form.grad} error={errors.grad} onChange={(event) => setForm({ ...form, grad: event.target.value })} />
            <FormInput label="Naselje" value={form.naselje} onChange={(event) => setForm({ ...form, naselje: event.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Obriši zgradu"
        message={`Da li ste sigurni da želite obrisati zgradu "${confirm?.naziv}"?`}
        loading={saving}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </section>
  )
}
