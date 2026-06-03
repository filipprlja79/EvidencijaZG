import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { stanariApi } from '../api/stanariApi.js'
import { stanoviApi } from '../api/stanoviApi.js'
import { ulaziApi } from '../api/ulaziApi.js'
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
import { mockStanari, mockStanovi, mockUlazi } from '../data/mockData.js'
import { nextLocalId } from '../utils/formatters.js'

const initialForm = {
  brojStana: '',
  imeVlasnikaStana: '',
  ulazId: '',
  kvadratura: '',
  brojClanova: '',
  sprat: '',
  napomena: '',
}

export default function Stanovi() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [ulazi, setUlazi] = useState([])
  const [stanari, setStanari] = useState([])
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
      const [stanoviResult, ulaziResult, stanariResult] = await Promise.allSettled([
        stanoviApi.list(),
        ulaziApi.list(),
        stanariApi.list(),
      ])
      setItems(stanoviResult.status === 'fulfilled' ? stanoviResult.value : mockStanovi)
      setUlazi(ulaziResult.status === 'fulfilled' ? ulaziResult.value : mockUlazi)
      setStanari(stanariResult.status === 'fulfilled' ? stanariResult.value : mockStanari)
      setError(stanoviResult.status === 'rejected' ? 'API nije dostupan za stanove. Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [])

  const ulazOptions = ulazi.map((item) => ({
    value: item.id,
    label: `${item.zgrada?.naziv || 'Zgrada'} / ${item.nazivUlaza || item.brojUlaza}`,
  }))

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [
      item.brojStana,
      item.imeVlasnikaStana,
      item.ulaz?.nazivUlaza,
      item.ulaz?.zgrada?.naziv,
    ].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function selectedUlaz() {
    return ulazi.find((item) => String(item.id) === String(form.ulazId))
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
      brojStana: item.brojStana || '',
      imeVlasnikaStana: item.imeVlasnikaStana || '',
      ulazId: item.ulaz?.id || '',
      kvadratura: item.detalji?.kvadratura || '',
      brojClanova: item.detalji?.brojClanova || '',
      sprat: item.detalji?.sprat || '',
      napomena: item.detalji?.napomena || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const nextErrors = {}
    if (!form.brojStana) nextErrors.brojStana = 'Broj stana je obavezan.'
    if (!form.imeVlasnikaStana.trim()) nextErrors.imeVlasnikaStana = 'Ime vlasnika je obavezno.'
    if (!form.ulazId) nextErrors.ulazId = 'Ulaz je obavezan.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function save() {
    if (!validate()) return
    setSaving(true)
    const ulaz = selectedUlaz()
    const details = {
      kvadratura: Number(form.kvadratura || 0),
      brojClanova: Number(form.brojClanova || 0),
      sprat: Number(form.sprat || 0),
      napomena: form.napomena,
    }
    const payload = {
      brojStana: Number(form.brojStana),
      imeVlasnikaStana: form.imeVlasnikaStana,
      ulaz: ulaz ? { id: ulaz.id } : null,
      detalji: details,
    }
    try {
      const saved = editing ? await stanoviApi.update(editing.id, payload) : await stanoviApi.create(payload)
      const normalized = { ...saved, ulaz: saved.ulaz || ulaz, detalji: saved.detalji || details }
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? normalized : item))
        : [...current, normalized])
      showToast('Uspješno sačuvano.')
    } catch {
      const localItem = { id: editing?.id || nextLocalId(items), ...payload, ulaz, detalji: details }
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
      await stanoviApi.remove(confirm.id)
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
    { key: 'brojStana', header: 'Broj stana' },
    { key: 'imeVlasnikaStana', header: 'Vlasnik stana' },
    { key: 'ulaz', header: 'Ulaz', render: (row) => row.ulaz?.nazivUlaza || row.ulaz?.brojUlaza || '-' },
    { key: 'zgrada', header: 'Zgrada', render: (row) => row.ulaz?.zgrada?.naziv || '-' },
    { key: 'brojStanara', header: 'Broj stanara', render: (row) => stanari.filter((stanar) => stanar.stan?.id === row.id).length },
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
      <PageHeader title="Stanovi" subtitle="Evidencija stanova, vlasnika i detalja stambenih jedinica." actions={<Button icon={Plus} onClick={openCreate}>Dodaj stan</Button>} />
      <ErrorMessage message={error} />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži stanove..." />
      </div>
      <DataTable columns={columns} data={filteredItems} loading={loading} emptyTitle="Nema unesenih stanova" emptyDescription="Dodajte stan da biste ga povezali sa stanarima i obavezama." emptyAction={<Button icon={Plus} onClick={openCreate}>Dodaj stan</Button>} />

      <Modal
        open={modalOpen}
        title={editing ? 'Izmijeni stan' : 'Dodaj stan'}
        description="Unesite osnovne podatke i detalje stana."
        onClose={() => setModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Odustani</Button><Button loading={saving} onClick={save}>Sačuvaj</Button></>}
      >
        <div className="form-grid">
          <div className="form-grid two">
            <FormInput label="Broj stana" type="number" min="1" value={form.brojStana} error={errors.brojStana} onChange={(event) => setForm({ ...form, brojStana: event.target.value })} />
            <FormSelect label="Ulaz" value={form.ulazId} error={errors.ulazId} options={ulazOptions} onChange={(event) => setForm({ ...form, ulazId: event.target.value })} />
          </div>
          <FormInput label="Ime vlasnika stana" value={form.imeVlasnikaStana} error={errors.imeVlasnikaStana} onChange={(event) => setForm({ ...form, imeVlasnikaStana: event.target.value })} />
          <div className="form-grid two">
            <FormInput label="Kvadratura" type="number" min="0" value={form.kvadratura} onChange={(event) => setForm({ ...form, kvadratura: event.target.value })} />
            <FormInput label="Broj članova" type="number" min="0" value={form.brojClanova} onChange={(event) => setForm({ ...form, brojClanova: event.target.value })} />
          </div>
          <div className="form-grid two">
            <FormInput label="Sprat" type="number" value={form.sprat} onChange={(event) => setForm({ ...form, sprat: event.target.value })} />
            <FormInput label="Napomena" value={form.napomena} onChange={(event) => setForm({ ...form, napomena: event.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} title="Obriši stan" message={`Da li ste sigurni da želite obrisati stan broj "${confirm?.brojStana}"?`} loading={saving} onCancel={() => setConfirm(null)} onConfirm={remove} />
    </section>
  )
}
