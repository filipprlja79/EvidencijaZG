/*
 * Komentar projekta: Page komponenta koja predstavlja stranicu za pregled, slanje i upravljanje prilozima obavjestenja.
 */

import { useEffect, useMemo, useState } from 'react'
import { Archive, Download, FileText, Paperclip, Pencil, Plus, Send, Trash2, Upload } from 'lucide-react'
import { getApiMessage } from '../api/axiosClient.js'
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
import { useRole } from '../context/RoleContext.jsx'
import { mockObavjestenja, mockStanari } from '../data/mockData.js'
import { date, fullName, nextLocalId, statusVariant } from '../utils/formatters.js'

const initialForm = {
  // Pocetno stanje forme za kreiranje ili izmjenu obavjestenja.
  naslov: '',
  tekst: '',
  sendAll: true,
  stanarIds: [],
}

export default function Obavjestenja() {
  const { showToast } = useToast()
  const { role } = useRole()
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
  const [fileModal, setFileModal] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileSaving, setFileSaving] = useState(false)
  const [fileError, setFileError] = useState('')
  // Backend dozvoljava upravljanje prilozima samo adminu i starjesini.
  const canManageFiles = role === 'admin' || role === 'starjesina'

  useEffect(() => {
    async function load() {
      // Ucitavamo obavjestenja i stanare paralelno; ako API ne radi, prikazujemo demo podatke.
      setLoading(true)
      const [obavjestenjaResult, stanariResult] = await Promise.allSettled([
        obavjestenjaApi.list(),
        stanariApi.list(),
      ])
      setItems(obavjestenjaResult.status === 'fulfilled' ? obavjestenjaResult.value : mockObavjestenja)
      setStanari(stanariResult.status === 'fulfilled' ? stanariResult.value : mockStanari)
      setError(obavjestenjaResult.status === 'rejected' ? ' Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [])

  const filteredItems = useMemo(() => {
    // Pretraga se radi lokalno po naslovu, tekstu i tipu obavjestenja.
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
    // Validacija forme prije slanja prema backend-u.
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
      // Backend ocekuje naslov, tekst, tip poruke i listu primalaca.
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
        fajlovi: saved?.uploadedFiles || editing?.fajlovi || editing?.uploadedFiles || [],
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
        fajlovi: editing?.fajlovi || editing?.uploadedFiles || [],
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

  async function openFiles(item) {
    // Otvara modal i povlaci svjezu listu priloga za izabrano obavjestenje.
    setFileModal(item)
    setSelectedFile(null)
    setFileError('')
    try {
      const fajlovi = await obavjestenjaApi.listFiles(item.id)
      setItems((current) => current.map((notice) => (notice.id === item.id ? { ...notice, fajlovi } : notice)))
      setFileModal({ ...item, fajlovi })
    } catch (error) {
      setFileError(getApiMessage(error))
    }
  }

  async function uploadAttachment() {
    // Salje izabrani fajl kao multipart/form-data na backend.
    if (!fileModal || !selectedFile) {
      setFileError('Izaberite PDF, sliku ili Word dokument.')
      return
    }
    setFileSaving(true)
    setFileError('')
    try {
      const uploaded = await obavjestenjaApi.uploadFile(fileModal.id, selectedFile)
      const nextFiles = [uploaded, ...(fileModal.fajlovi || [])]
      setItems((current) => current.map((notice) => (notice.id === fileModal.id ? { ...notice, fajlovi: nextFiles } : notice)))
      setFileModal({ ...fileModal, fajlovi: nextFiles })
      setSelectedFile(null)
      showToast('Fajl je dodat uz obavjestenje.')
    } catch (error) {
      setFileError(getApiMessage(error))
    } finally {
      setFileSaving(false)
    }
  }

  async function downloadAttachment(fajl) {
    try {
      const response = await obavjestenjaApi.downloadFile(fajl.id)
      // Kreira privremeni browser URL za blob i simulira klik na link za download.
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = getFileName(fajl.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      showToast(getApiMessage(error), 'error')
    }
  }

  async function removeAttachment(fajlId) {
    // Brise prilog i lokalno osvjezava listu da UI odmah prikaze novo stanje.
    if (!fileModal) return
    setFileSaving(true)
    setFileError('')
    try {
      await obavjestenjaApi.removeFile(fajlId)
      const nextFiles = (fileModal.fajlovi || []).filter((fajl) => fajl.id !== fajlId)
      setItems((current) => current.map((notice) => (notice.id === fileModal.id ? { ...notice, fajlovi: nextFiles } : notice)))
      setFileModal({ ...fileModal, fajlovi: nextFiles })
      showToast('Fajl je obrisan.')
    } catch (error) {
      setFileError(getApiMessage(error))
    } finally {
      setFileSaving(false)
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
              <span>{item.fajlovi?.length || item.uploadedFiles?.length || 0} priloga</span>
            </div>
            <div className="row-actions">
              <Button variant="secondary" size="sm" icon={Paperclip} onClick={() => openFiles(item)}>Prilozi</Button>
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

      <Modal
        open={Boolean(fileModal)}
        title={`Prilozi: ${fileModal?.naslov || ''}`}
        description={canManageFiles ? 'Dodajte PDF, sliku ili Word dokument uz odabrano obavjestenje.' : 'Stanari mogu pregledati i preuzeti priloge.'}
        onClose={() => setFileModal(null)}
        footer={<><Button variant="secondary" onClick={() => setFileModal(null)}>Zatvori</Button>{canManageFiles ? <Button loading={fileSaving} icon={Upload} onClick={uploadAttachment}>Dodaj fajl</Button> : null}</>}
      >
        <div className="attachment-panel">
          {canManageFiles ? (
            <label className="file-drop">
              <Upload size={20} />
              <span>{selectedFile ? selectedFile.name : 'Izaberite fajl za upload'}</span>
              <small>Dozvoljeno: PDF, PNG, JPG, DOC, DOCX. Maksimalno 10 MB.</small>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              />
            </label>
          ) : null}
          <ErrorMessage message={fileError} />
          <div className="attachment-list">
            {(fileModal?.fajlovi || []).length ? fileModal.fajlovi.map((fajl) => (
              <div className="attachment-item" key={fajl.id}>
                <FileText size={18} />
                <div>
                  <strong>{getFileName(fajl.filename)}</strong>
                  <span>UploadedFile zapis povezan preko ManyToMany relacije</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Preuzmi fajl" icon={Download} onClick={() => downloadAttachment(fajl)} />
                {canManageFiles ? <Button variant="ghost" size="icon" aria-label="Obrisi fajl" icon={Trash2} onClick={() => removeAttachment(fajl.id)} disabled={fileSaving} /> : null}
              </div>
            )) : (
              <div className="attachment-empty">
                <Paperclip size={20} />
                <p>Ovo obavjestenje jos nema priloge.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} title="Obriši obavještenje" message={`Da li želite obrisati obavještenje "${confirm?.naslov}"?`} loading={saving} onCancel={() => setConfirm(null)} onConfirm={remove} />
    </section>
  )
}

function getFileName(path) {
  if (!path) return 'fajl'
  return String(path).split(/[\\/]/).pop() || 'fajl'
}

