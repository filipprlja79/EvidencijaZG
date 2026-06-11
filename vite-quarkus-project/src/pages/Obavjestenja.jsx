/*
 * Komentar projekta: Page komponenta za pregled, slanje i upravljanje prilozima obavjestenja.
 */

import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Paperclip, Pencil, Plus, Send, Trash2, Upload, Vote } from 'lucide-react'
import { getApiMessage } from '../api/axiosClient.js'
import { glasanjaApi } from '../api/glasanjaApi.js'
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
import { useAuth } from '../context/AuthContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { mockObavjestenja, mockStanari } from '../data/mockData.js'
import { date, fullName, nextLocalId, statusVariant } from '../utils/formatters.js'

const initialForm = {
  naslov: '',
  tekst: '',
  sendAll: true,
  stanarIds: [],
}

const initialPollForm = {
  naslov: '',
  pitanje: '',
  opcija1: '',
  opcija2: '',
  opcija3: '',
}

export default function Obavjestenja() {
  const { showToast } = useToast()
  const { profile } = useAuth()
  const { role } = useRole()
  const effectiveRole = profile?.role || role
  const canManage = effectiveRole === 'admin' || effectiveRole === 'starjesina'
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
  const [polls, setPolls] = useState([])
  const [pollModalOpen, setPollModalOpen] = useState(false)
  const [pollForm, setPollForm] = useState(initialPollForm)
  const [pollSaving, setPollSaving] = useState(false)
  const [votingId, setVotingId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [obavjestenjaResult, stanariResult] = await Promise.allSettled([
        canManage ? obavjestenjaApi.list() : profile?.id ? obavjestenjaApi.listMine(profile.id) : Promise.resolve([]),
        canManage ? stanariApi.list() : Promise.resolve([]),
      ])
      setItems(obavjestenjaResult.status === 'fulfilled' ? obavjestenjaResult.value : mockObavjestenja)
      setStanari(stanariResult.status === 'fulfilled' ? stanariResult.value : mockStanari)
      setError(obavjestenjaResult.status === 'rejected' ? 'Prikazani su demo podaci.' : '')
      setLoading(false)
    }
    load()
  }, [canManage, profile?.id])

  useEffect(() => {
    async function loadPolls() {
      try {
        setPolls(await glasanjaApi.list({ ulazId: profile?.ulazId, stanarId: profile?.id }))
      } catch (err) {
        showToast(getApiMessage(err), 'error')
      }
    }
    if (profile?.id) {
      loadPolls()
    }
  }, [profile?.id, profile?.ulazId, showToast])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [item.naslov, item.tekst, item.tip].join(' ').toLowerCase().includes(query))
  }, [items, search])

  function openCreate() {
    if (!canManage) {
      showToast('Samo admin i starjesina mogu dodavati obavjestenja.', 'warning')
      return
    }
    setEditing(null)
    setForm(initialForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(item) {
    if (!canManage) return
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
      const saved = editing ? await obavjestenjaApi.update(editing.id, payload) : await obavjestenjaApi.send(payload)
      const normalized = {
        id: saved?.id || editing?.id || nextLocalId(items),
        ...payload,
        stanari: recipients,
        fajlovi: saved?.uploadedFiles || editing?.fajlovi || editing?.uploadedFiles || [],
        kreiranoAt: saved?.kreiranoAt || editing?.kreiranoAt || new Date().toISOString(),
        status: 'Aktivno',
      }
      setItems((current) => editing ? current.map((item) => (item.id === editing.id ? normalized : item)) : [normalized, ...current])
      showToast('Uspjesno sacuvano.')
    } catch (err) {
      showToast(getApiMessage(err), 'error')
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
      showToast('Uspjesno obrisano.')
    } catch (err) {
      showToast(getApiMessage(err), 'error')
    } finally {
      setItems((current) => current.filter((item) => item.id !== confirm.id))
      setSaving(false)
      setConfirm(null)
    }
  }

  async function openFiles(item) {
    setFileModal(item)
    setSelectedFile(null)
    setFileError('')
    try {
      const fajlovi = await obavjestenjaApi.listFiles(item.id)
      setItems((current) => current.map((notice) => (notice.id === item.id ? { ...notice, fajlovi } : notice)))
      setFileModal({ ...item, fajlovi })
    } catch (err) {
      setFileError(getApiMessage(err))
    }
  }

  async function uploadAttachment() {
    if (!canManage) {
      setFileError('Samo admin i starjesina mogu dodavati fajlove.')
      return
    }
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
    } catch (err) {
      setFileError(getApiMessage(err))
    } finally {
      setFileSaving(false)
    }
  }

  async function downloadAttachment(fajl) {
    try {
      const response = await obavjestenjaApi.downloadFile(fajl.id)
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = getFileName(fajl.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      showToast(getApiMessage(err), 'error')
    }
  }

  async function removeAttachment(fajlId) {
    if (!fileModal || !canManage) return
    setFileSaving(true)
    setFileError('')
    try {
      await obavjestenjaApi.removeFile(fajlId)
      const nextFiles = (fileModal.fajlovi || []).filter((fajl) => fajl.id !== fajlId)
      setItems((current) => current.map((notice) => (notice.id === fileModal.id ? { ...notice, fajlovi: nextFiles } : notice)))
      setFileModal({ ...fileModal, fajlovi: nextFiles })
      showToast('Fajl je obrisan.')
    } catch (err) {
      setFileError(getApiMessage(err))
    } finally {
      setFileSaving(false)
    }
  }

  function openPollCreate() {
    if (!canManage) {
      showToast('Samo admin i starjesina mogu otvoriti glasanje.', 'warning')
      return
    }
    setPollForm(initialPollForm)
    setPollModalOpen(true)
  }

  async function createPoll() {
    const opcije = [pollForm.opcija1, pollForm.opcija2, pollForm.opcija3].map((item) => item.trim()).filter(Boolean)
    if (!pollForm.naslov.trim() || !pollForm.pitanje.trim() || opcije.length < 2) {
      showToast('Unesite naslov, pitanje i najmanje dvije opcije.', 'warning')
      return
    }
    setPollSaving(true)
    try {
      const created = await glasanjaApi.create({
        naslov: pollForm.naslov,
        pitanje: pollForm.pitanje,
        ulazId: profile?.ulazId || null,
        opcije,
      })
      setPolls((current) => [created, ...current])
      setPollModalOpen(false)
      showToast('Glasanje je otvoreno.')
    } catch (err) {
      showToast(getApiMessage(err), 'error')
    } finally {
      setPollSaving(false)
    }
  }

  async function submitVote(poll, option) {
    if (!profile?.id) {
      showToast('Morate biti prijavljeni da biste glasali.', 'warning')
      return
    }
    setVotingId(`${poll.id}-${option.id}`)
    try {
      const updated = await glasanjaApi.vote(poll.id, { stanarId: profile.id, opcijaId: option.id })
      setPolls((current) => current.map((item) => (item.id === poll.id ? updated : item)))
      showToast('Vas glas je sacuvan.')
    } catch (err) {
      showToast(getApiMessage(err), 'error')
    } finally {
      setVotingId(null)
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Obavjestenja"
        subtitle={canManage ? 'Slanje i pregled obavjestenja za stanare i ulaze.' : 'Pregled obavjestenja za vas stan i ulaz.'}
        actions={canManage ? <Button icon={Plus} onClick={openCreate}>Dodaj obavjestenje</Button> : null}
      />
      <ErrorMessage message={error} />
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Pretrazi obavjestenja..." />
      </div>

      <div className="cards-grid">
        {loading ? (
          <div className="panel-card"><p>Ucitavanje...</p></div>
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
              {canManage ? <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(item)}>Izmijeni</Button> : null}
              {canManage ? <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirm(item)}>Obrisi</Button> : null}
            </div>
          </article>
        )) : (
          <div className="panel-card">
            <h3>Nema obavjestenja</h3>
            <p>{canManage ? 'Dodajte prvo obavjestenje ili posaljite poruku svim stanarima.' : 'Trenutno nema obavjestenja za vas nalog.'}</p>
            {canManage ? <Button icon={Plus} onClick={openCreate}>Dodaj obavjestenje</Button> : null}
          </div>
        )}
      </div>

      <section className="page-stack">
        <PageHeader
          title="Glasanja"
          subtitle="Online odluke za izbor starjesine, ciscenje ulaza i druga pitanja."
          actions={canManage ? <Button icon={Vote} onClick={openPollCreate}>Novo glasanje</Button> : null}
        />
        <div className="cards-grid">
          {polls.length ? polls.map((poll) => {
            const totalVotes = poll.opcije.reduce((sum, option) => sum + Number(option.glasova || 0), 0)
            return (
              <article className="notice-card" key={poll.id}>
                <div className="panel-header">
                  <h3>{poll.naslov}</h3>
                  <Badge variant={poll.aktivno ? 'success' : 'neutral'}>{poll.aktivno ? 'Aktivno' : 'Zatvoreno'}</Badge>
                </div>
                <p>{poll.pitanje}</p>
                <div className="notice-meta">
                  <span>{poll.ulazNaziv}</span>
                  <span>{totalVotes} glasova</span>
                  <span>{date(poll.kreiranoAt)}</span>
                </div>
                <div className="poll-options">
                  {poll.opcije.map((option) => {
                    const percent = totalVotes ? Math.round((Number(option.glasova || 0) / totalVotes) * 100) : 0
                    const selected = poll.mojGlasOpcijaId === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`poll-option ${selected ? 'selected' : ''}`}
                        onClick={() => submitVote(poll, option)}
                        disabled={Boolean(votingId)}
                      >
                        <span>{option.tekst}</span>
                        <strong>{option.glasova} ({percent}%)</strong>
                        <i style={{ width: `${percent}%` }} />
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          }) : (
            <div className="panel-card">
              <h3>Nema aktivnih glasanja</h3>
              <p>{canManage ? 'Otvorite glasanje za odluke stanara.' : 'Trenutno nema glasanja za vas ulaz.'}</p>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Izmijeni obavjestenje' : 'Novo obavjestenje'}
        description="Unesite poruku i odaberite primaoce."
        onClose={() => setModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Odustani</Button><Button loading={saving} icon={Send} onClick={save}>Posalji</Button></>}
      >
        <div className="form-grid">
          <FormInput label="Naslov" value={form.naslov} error={errors.naslov} onChange={(event) => setForm({ ...form, naslov: event.target.value })} />
          <FormInput label="Tekst" as="textarea" value={form.tekst} error={errors.tekst} onChange={(event) => setForm({ ...form, tekst: event.target.value })} />
          <FormCheckbox label="Posalji svima" checked={form.sendAll} onChange={(value) => setForm({ ...form, sendAll: value, stanarIds: value ? [] : form.stanarIds })} />
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
        open={pollModalOpen}
        title="Novo glasanje"
        description="Unesite pitanje i opcije za online glasanje stanara."
        onClose={() => setPollModalOpen(false)}
        footer={<><Button variant="secondary" onClick={() => setPollModalOpen(false)}>Odustani</Button><Button loading={pollSaving} icon={Vote} onClick={createPoll}>Otvori glasanje</Button></>}
      >
        <div className="form-grid">
          <FormInput label="Naslov" value={pollForm.naslov} onChange={(event) => setPollForm({ ...pollForm, naslov: event.target.value })} />
          <FormInput label="Pitanje" as="textarea" value={pollForm.pitanje} onChange={(event) => setPollForm({ ...pollForm, pitanje: event.target.value })} />
          <div className="form-grid two">
            <FormInput label="Opcija 1" value={pollForm.opcija1} onChange={(event) => setPollForm({ ...pollForm, opcija1: event.target.value })} />
            <FormInput label="Opcija 2" value={pollForm.opcija2} onChange={(event) => setPollForm({ ...pollForm, opcija2: event.target.value })} />
          </div>
          <FormInput label="Opcija 3" value={pollForm.opcija3} onChange={(event) => setPollForm({ ...pollForm, opcija3: event.target.value })} />
        </div>
      </Modal>

      <Modal
        open={Boolean(fileModal)}
        title={`Prilozi: ${fileModal?.naslov || ''}`}
        description={canManage ? 'Dodajte PDF, sliku ili Word dokument uz odabrano obavjestenje.' : 'Stanari mogu pregledati i preuzeti priloge.'}
        onClose={() => setFileModal(null)}
        footer={<><Button variant="secondary" onClick={() => setFileModal(null)}>Zatvori</Button>{canManage ? <Button loading={fileSaving} icon={Upload} onClick={uploadAttachment}>Dodaj fajl</Button> : null}</>}
      >
        <div className="attachment-panel">
          {canManage ? (
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
                  <span>Prilog obavjestenja</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Preuzmi fajl" icon={Download} onClick={() => downloadAttachment(fajl)} />
                {canManage ? <Button variant="ghost" size="icon" aria-label="Obrisi fajl" icon={Trash2} onClick={() => removeAttachment(fajl.id)} disabled={fileSaving} /> : null}
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

      <ConfirmDialog open={Boolean(confirm)} title="Obrisi obavjestenje" message={`Da li zelite obrisati obavjestenje "${confirm?.naslov}"?`} loading={saving} onCancel={() => setConfirm(null)} onConfirm={remove} />
    </section>
  )
}

function getFileName(path) {
  if (!path) return 'fajl'
  return String(path).split(/[\\/]/).pop() || 'fajl'
}
