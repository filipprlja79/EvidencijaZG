/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ulaziApi } from '../api/ulaziApi.js'
import { zgradeApi } from '../api/zgradeApi.js'
import { stanoviApi } from '../api/stanoviApi.js'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import FormInput from '../components/forms/FormInput.jsx'
import FormSelect from '../components/forms/FormSelect.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockStanovi, mockUlazi, mockZgrade } from '../data/mockData.js'
import { nextLocalId } from '../utils/formatters.js'

const initialForm = { brojUlaza: '', nazivUlaza: '', brojZiroRacuna: '', zgradaId: '' }

export default function Ulazi() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [zgrade, setZgrade] = useState([])
  const [stanovi, setStanovi] = useState([])
  const [search, setSearch] = useState('')
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
      const [ulaziResult, zgradeResult, stanoviResult] = await Promise.allSettled([
        ulaziApi.list(),
        zgradeApi.list(),
        stanoviApi.list(),
      ])
      setItems(ulaziResult.status === 'fulfilled' ? ulaziResult.value : mockUlazi)
      setZgrade(zgradeResult.status === 'fulfilled' ? zgradeResult.value : mockZgrade)
      setStanovi(stanoviResult.status === 'fulfilled' ? stanoviResult.value : mockStanovi)
      setError(ulaziResult.status === 'rejected' ? ' Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [])

  const zgradaOptions = zgrade.map((item) => ({ value: item.id, label: `${item.naziv} - ${item.grad}` }))

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [
      item.brojUlaza,
      item.nazivUlaza,
      item.brojZiroRacuna,
      item.zgrada?.naziv,
    ].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function selectedZgrada() {
    return zgrade.find((item) => String(item.id) === String(form.zgradaId))
  }

  function openCreate() {
    setEditing(null)
    setForm(initialForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      brojUlaza: item.brojUlaza || '',
      nazivUlaza: item.nazivUlaza || '',
      brojZiroRacuna: item.brojZiroRacuna || '',
      zgradaId: item.zgrada?.id || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const nextErrors = {}
    if (!form.brojUlaza.trim()) nextErrors.brojUlaza = 'Broj ulaza je obavezan.'
    if (!form.zgradaId) nextErrors.zgradaId = 'Zgrada je obavezna.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function save() {
    if (!validate()) return
    setSaving(true)
    const zgrada = selectedZgrada()
    const payload = {
      brojUlaza: form.brojUlaza,
      nazivUlaza: form.nazivUlaza,
      brojZiroRacuna: form.brojZiroRacuna,
      zgrada: zgrada ? { id: zgrada.id } : null,
    }
    try {
      const saved = editing ? await ulaziApi.update(editing.id, payload) : await ulaziApi.create(payload)
      const normalized = { ...saved, zgrada: saved.zgrada || zgrada }
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? normalized : item))
        : [...current, normalized])
      showToast('Uspješno sačuvano.')
    } catch {
      const localItem = { id: editing?.id || nextLocalId(items), ...form, zgrada }
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
      await ulaziApi.remove(confirm.id)
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
    { key: 'brojUlaza', header: 'Broj ulaza' },
    { key: 'nazivUlaza', header: 'Naziv ulaza' },
    { key: 'brojZiroRacuna', header: 'Žiro račun' },
    { key: 'zgrada', header: 'Zgrada', render: (row) => row.zgrada?.naziv || '-' },
    { key: 'brojStanova', header: 'Broj stanova', render: (row) => stanovi.filter((stan) => stan.ulaz?.id === row.id).length },
    {
      key: 'actions',
      header: 'Akcije',
      align: 'right',
      render: (row) => (
        <div className="row-actions">
          <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(row)}>Izmijeni</Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirm(row)}>Obriši</Button>
        </div>
      ),
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader title="Ulazi" subtitle="Upravljanje ulazima, žiro računima i vezom sa zgradama." actions={<Button icon={Plus} onClick={openCreate}>Dodaj ulaz</Button>} />
      <ErrorMessage message={error} />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži ulaze..." />
      </div>
      <DataTable columns={columns} data={filteredItems} loading={loading} emptyTitle="Nema unesenih ulaza" emptyDescription="Dodajte ulaz da biste mogli voditi stanove i stanare." emptyAction={<Button icon={Plus} onClick={openCreate}>Dodaj ulaz</Button>} />

      <Modal
        open={modalOpen}
        title={editing ? 'Izmijeni ulaz' : 'Dodaj ulaz'}
        description="Povežite ulaz sa zgradom i unesite podatke za naplatu."
        onClose={() => setModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Odustani</Button><Button loading={saving} onClick={save}>Sačuvaj</Button></>}
      >
        <div className="form-grid">
          <FormSelect label="Zgrada" value={form.zgradaId} error={errors.zgradaId} options={zgradaOptions} onChange={(event) => setForm({ ...form, zgradaId: event.target.value })} />
          <div className="form-grid two">
            <FormInput label="Broj ulaza" value={form.brojUlaza} error={errors.brojUlaza} onChange={(event) => setForm({ ...form, brojUlaza: event.target.value })} />
            <FormInput label="Naziv ulaza" value={form.nazivUlaza} onChange={(event) => setForm({ ...form, nazivUlaza: event.target.value })} />
          </div>
          <FormInput label="Broj žiro računa" value={form.brojZiroRacuna} onChange={(event) => setForm({ ...form, brojZiroRacuna: event.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} title="Obriši ulaz" message={`Da li ste sigurni da želite obrisati ulaz "${confirm?.nazivUlaza || confirm?.brojUlaza}"?`} loading={saving} onCancel={() => setConfirm(null)} onConfirm={remove} />
    </section>
  )
}

