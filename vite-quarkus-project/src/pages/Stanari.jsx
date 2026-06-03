/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { dugovanjaApi } from '../api/dugovanjaApi.js'
import { stanariApi } from '../api/stanariApi.js'
import { stanoviApi } from '../api/stanoviApi.js'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import SearchInput from '../components/ui/SearchInput.jsx'
import FormCheckbox from '../components/forms/FormCheckbox.jsx'
import FormInput from '../components/forms/FormInput.jsx'
import FormSelect from '../components/forms/FormSelect.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockDugovanja, mockStanari, mockStanovi } from '../data/mockData.js'
import { fullName, money, nextLocalId } from '../utils/formatters.js'

const initialForm = {
  ime: '',
  prezime: '',
  brTelefona: '',
  username: '',
  password: '',
  starjesina: false,
  stanId: '',
}

export default function Stanari() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [stanovi, setStanovi] = useState([])
  const [dugovanja, setDugovanja] = useState([])
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
      const [stanariResult, stanoviResult, dugovanjaResult] = await Promise.allSettled([
        stanariApi.list(),
        stanoviApi.list(),
        dugovanjaApi.list(),
      ])
      setItems(stanariResult.status === 'fulfilled' ? stanariResult.value : mockStanari)
      setStanovi(stanoviResult.status === 'fulfilled' ? stanoviResult.value : mockStanovi)
      setDugovanja(dugovanjaResult.status === 'fulfilled' ? dugovanjaResult.value : mockDugovanja)
      setError(stanariResult.status === 'rejected' ? 'API nije dostupan za stanare. Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [])

  const stanOptions = stanovi.map((item) => ({
    value: item.id,
    label: `Stan ${item.brojStana} - ${item.ulaz?.zgrada?.naziv || item.ulaz?.nazivUlaza || 'Ulaz'}`,
  }))

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [
      item.ime,
      item.prezime,
      item.brTelefona,
      item.username,
      item.stan?.brojStana,
    ].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function selectedStan() {
    return stanovi.find((item) => String(item.id) === String(form.stanId))
  }

  function debtFor(stanar) {
    const match = dugovanja.find((item) => item.stanar?.id === stanar.id)
    return match?.ukupanDug ?? stanar.trenutniDug ?? 0
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
      ime: item.ime || '',
      prezime: item.prezime || '',
      brTelefona: item.brTelefona || '',
      username: item.username || '',
      password: '',
      starjesina: Boolean(item.starjesina || item.tipNaloga === 2),
      stanId: item.stan?.id || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const nextErrors = {}
    if (!form.ime.trim()) nextErrors.ime = 'Ime je obavezno.'
    if (!form.prezime.trim()) nextErrors.prezime = 'Prezime je obavezno.'
    if (!form.username.trim()) nextErrors.username = 'Username je obavezan.'
    if (!editing && !form.password.trim()) nextErrors.password = 'Password je obavezan.'
    if (!form.stanId) nextErrors.stanId = 'Stan je obavezan.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function save() {
    if (!validate()) return
    setSaving(true)
    const stan = selectedStan()
    const payload = {
      ime: form.ime,
      prezime: form.prezime,
      brTelefona: form.brTelefona,
      username: form.username,
      password: form.password,
      starjesina: form.starjesina,
      tipNaloga: form.starjesina ? 2 : 1,
      stan: stan ? { id: stan.id } : null,
    }
    try {
      const saved = editing ? await stanariApi.update(editing.id, payload) : await stanariApi.create(payload)
      const normalized = { ...saved, stan: saved.stan || stan }
      setItems((current) => editing
        ? current.map((item) => (item.id === editing.id ? normalized : item))
        : [...current, normalized])
      showToast('Uspješno sačuvano.')
    } catch {
      const localItem = { id: editing?.id || nextLocalId(items), ...payload, stan }
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
      await stanariApi.remove(confirm.id)
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
    { key: 'ime', header: 'Ime i prezime', render: (row) => fullName(row) },
    { key: 'brTelefona', header: 'Telefon' },
    { key: 'username', header: 'Username' },
    { key: 'stan', header: 'Stan', render: (row) => row.stan?.brojStana || '-' },
    { key: 'starjesina', header: 'Starješina', render: (row) => <Badge variant={row.starjesina || row.tipNaloga === 2 ? 'info' : 'neutral'}>{row.starjesina || row.tipNaloga === 2 ? 'Da' : 'Ne'}</Badge> },
    { key: 'trenutniDug', header: 'Trenutni dug', render: (row) => money(debtFor(row)) },
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
      <PageHeader title="Stanari" subtitle="Upravljanje stanarima, nalozima i vezom sa stanovima." actions={<Button icon={Plus} onClick={openCreate}>Dodaj stanara</Button>} />
      <ErrorMessage message={error} />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži stanare..." />
      </div>
      <DataTable columns={columns} data={filteredItems} loading={loading} emptyTitle="Nema unesenih stanara" emptyDescription="Dodajte prvog stanara i povežite ga sa stanom." emptyAction={<Button icon={Plus} onClick={openCreate}>Dodaj stanara</Button>} />

      <Modal
        open={modalOpen}
        title={editing ? 'Izmijeni stanara' : 'Dodaj stanara'}
        description="Unesite podatke naloga i stan u kojem stanar živi."
        onClose={() => setModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Odustani</Button><Button loading={saving} onClick={save}>Sačuvaj</Button></>}
      >
        <div className="form-grid">
          <div className="form-grid two">
            <FormInput label="Ime" value={form.ime} error={errors.ime} onChange={(event) => setForm({ ...form, ime: event.target.value })} />
            <FormInput label="Prezime" value={form.prezime} error={errors.prezime} onChange={(event) => setForm({ ...form, prezime: event.target.value })} />
          </div>
          <div className="form-grid two">
            <FormInput label="Broj telefona" value={form.brTelefona} onChange={(event) => setForm({ ...form, brTelefona: event.target.value })} />
            <FormSelect label="Stan" value={form.stanId} error={errors.stanId} options={stanOptions} onChange={(event) => setForm({ ...form, stanId: event.target.value })} />
          </div>
          <div className="form-grid two">
            <FormInput label="Username" value={form.username} error={errors.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
            <FormInput label="Password" type="password" value={form.password} error={errors.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </div>
          <FormCheckbox label="Starješina ulaza" checked={form.starjesina} onChange={(value) => setForm({ ...form, starjesina: value })} />
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} title="Obriši stanara" message={`Da li ste sigurni da želite obrisati stanara "${fullName(confirm)}"?`} loading={saving} onCancel={() => setConfirm(null)} onConfirm={remove} />
    </section>
  )
}

