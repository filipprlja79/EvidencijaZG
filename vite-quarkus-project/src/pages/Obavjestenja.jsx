import { useEffect, useMemo, useState } from 'react'
import { Archive, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { obavjestenjaApi } from '../api/obavjestenjaApi.js'
import { stanariApi } from '../api/stanariApi.js'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import FormCheckbox from '../components/forms/FormCheckbox.jsx'
import FormInput from '../components/forms/FormInput.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockObavjestenja, mockStanari } from '../data/mockData.js'
import { date, fullName, nextLocalId, statusVariant } from '../utils/formatters.js'

const initialForm = {
  naslov: '',
  tekst: '',
  sendAll: true,
  stanarIds: [],
}

export default function Obavjestenja() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
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
      const [obavjestenjaResult, stanariResult] = await Promise.allSettled([
        obavjestenjaApi.list(),
        stanariApi.list(),
      ])
      setItems(obavjestenjaResult.status === 'fulfilled' ? obavjestenjaResult.value : mockObavjestenja)
      setStanari(stanariResult.status === 'fulfilled' ? stanariResult.value : mockStanari)
      setError(obavjestenjaResult.status === 'rejected' ? 'API nije dostupan za obavještenja. Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [item.naslov, item.tekst, item.tip].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function openCreate() {
    setEditing(null)
    setForm(initialForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(item) {
    const recipients = item.stanari?.map((stanar) => stanar.id) || []
    setEditing(item)
    setForm({
      naslov: item.naslov || '',
      tekst: item.tekst || '',
      sendAll: item.tip === 'GENERAL' || recipients.length === stanari.length,
      stanarIds: recipients,
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const nextErrors = {}
    if (!form.naslov.trim()) nextErrors.naslov = 'Naslov je obavezan.'
    if (!form.tekst.trim()) nextErrors.tekst = 'Tekst je obavezan.'
    if (!form.sendAll && form.stanarIds.length === 0) nextErrors.stanari = 'Izaberite makar jednog stanara.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function toggleRecipient(id) {
    setForm((current) => ({
      ...current,
      stanarIds: current.stanarIds.includes(id)
        ? current.stanarIds.filter((item) => item !== id)
        : [...current.stanarIds, id],
    }))
  }

  async function save() {
    if (!validate()) return
    setSaving(true)
    const recipients = form.sendAll ? stanari : stanari.filter((stanar) => form.stanarIds.includes(stanar.id))
    const payload = {
      naslov: form.naslov,
      tekst: form.tekst,
      tip: form.sendAll ? 'GENERAL' : 'PRIVATE',
      stanarIds: recipients.map((stanar) => stanar.id),
    }
    try {
      const saved = editing
        ? await obavjestenjaApi.update(editing.id, payload)
        : await obavjestenjaApi.send(payload)
      const normalized = {
        id: saved?.id || editing?.id || nextLocalId(items),
        ...payload,
        stanari: recipients,
        kreiranoAt: saved?.kreiranoAt || editing?.kreiranoAt || new Date().toISOString(),
        status: 'Aktivno',
      }
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? normalized : item))
        : [normalized, ...current])
      showToast('Uspješno sačuvano.')
    } catch {
      const localItem = {
        id: editing?.id || nextLocalId(items),
        ...payload,
        stanari: recipients,
        kreiranoAt: editing?.kreiranoAt || new Date().toISOString(),
        status: 'Aktivno',
      }
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? localItem : item))
        : [localItem, ...current])
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
      await obavjestenjaApi.remove(confirm.id)
      showToast('Uspješno obrisano.')
    } catch {
      showToast('Obrisano lokalno jer API nije dostupan.', 'info')
    } finally {
      setItems((current) => current.filter((item) => item.id !== confirm.id))
      setSaving(false)
      setConfirm(null)
    }
  }

  return (
    <section className="page-stack">
      <PageHeader title="Obavještenja" subtitle="Slanje i pregled obavještenja za stanare i ulaze." actions={<Button icon={Plus} onClick={openCreate}>Dodaj obavještenje</Button>} />
      <ErrorMessage message={error} />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži obavještenja..." />
      </div>

      <div className="cards-grid">
        {loading ? (
          <div className="panel-card"><p>Učitavanje...</p></div>
        ) : filteredItems.length ? filteredItems.map((item) => (
          <article className="notice-card" key={item.id}>
            <div className="panel-header">
              <h3>{item.naslov}</h3>
              <Badge variant={statusVariant(item.status || 'Aktivno')}>{item.status || 'Aktivno'}</Badge>
            </div>
            <p>{item.tekst}</p>
            <div className="notice-meta">
              <span>{date(item.kreiranoAt)}</span>
              <span>{item.stanari?.length || 0} primaoca</span>
              <span>{item.tip || 'PRIVATE'}</span>
            </div>
            <div className="row-actions">
              <Button variant="secondary" size="sm" icon={Archive}>Arhiviraj</Button>
              <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(item)}>Izmijeni</Button>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirm(item)}>Obriši</Button>
            </div>
          </article>
        )) : (
          <div className="panel-card">
            <h3>Nema obavještenja</h3>
            <p>Dodajte prvo obavještenje ili pošaljite poruku svim stanarima.</p>
            <Button icon={Plus} onClick={openCreate}>Dodaj obavještenje</Button>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Izmijeni obavještenje' : 'Novo obavještenje'}
        description="Unesite poruku i odaberite primaoce."
        onClose={() => setModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Odustani</Button><Button loading={saving} icon={Send} onClick={save}>Pošalji</Button></>}
      >
        <div className="form-grid">
          <FormInput label="Naslov" value={form.naslov} error={errors.naslov} onChange={(event) => setForm({ ...form, naslov: event.target.value })} />
          <FormInput label="Tekst" as="textarea" value={form.tekst} error={errors.tekst} onChange={(event) => setForm({ ...form, tekst: event.target.value })} />
          <FormCheckbox label="Pošalji svima" checked={form.sendAll} onChange={(value) => setForm({ ...form, sendAll: value, stanarIds: value ? [] : form.stanarIds })} />
          {!form.sendAll ? (
            <div className="recipient-panel">
              {stanari.map((stanar) => (
                <button key={stanar.id} type="button" className={form.stanarIds.includes(stanar.id) ? 'recipient active' : 'recipient'} onClick={() => toggleRecipient(stanar.id)}>
                  {fullName(stanar)}
                </button>
              ))}
              {errors.stanari ? <small className="field-error">{errors.stanari}</small> : null}
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} title="Obriši obavještenje" message={`Da li želite obrisati obavještenje "${confirm?.naslov}"?`} loading={saving} onCancel={() => setConfirm(null)} onConfirm={remove} />
    </section>
  )
}
