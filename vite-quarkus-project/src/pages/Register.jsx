/*
 * Komentar projekta: Register stranica aplikacije.
 */

import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LogIn, ShieldCheck, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getApiMessage } from '../api/axiosClient.js'
import { publicLookupApi } from '../api/publicLookupApi.js'
import FormInput from '../components/forms/FormInput.jsx'
import FormSelect from '../components/forms/FormSelect.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const initialForm = {
  ime: '',
  prezime: '',
  email: '',
  ulazId: '',
  stanId: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const { isAuthenticated, login, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [ulazi, setUlazi] = useState([])
  const [stanovi, setStanovi] = useState([])
  const [error, setError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordScore = useMemo(() => {
    const checks = [
      form.password.length >= 8,
      /[a-z]/.test(form.password),
      /[A-Z]/.test(form.password),
      /\d/.test(form.password),
      /[^A-Za-z0-9]/.test(form.password),
    ]
    return checks.filter(Boolean).length
  }, [form.password])

  useEffect(() => {
    async function loadUlazi() {
      setLookupLoading(true)
      try {
        setUlazi(await publicLookupApi.ulazi())
      } catch (err) {
        const message = getApiMessage(err)
        setError(message)
        showToast(message, 'error')
      } finally {
        setLookupLoading(false)
      }
    }
    loadUlazi()
  }, [showToast])

  useEffect(() => {
    async function loadStanovi() {
      if (!form.ulazId) {
        setStanovi([])
        return
      }
      setLookupLoading(true)
      try {
        setStanovi(await publicLookupApi.stanovi(form.ulazId))
      } catch (err) {
        const message = getApiMessage(err)
        setError(message)
        showToast(message, 'error')
      } finally {
        setLookupLoading(false)
      }
    }
    loadStanovi()
  }, [form.ulazId, showToast])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updateUlaz(event) {
    setForm((current) => ({ ...current, ulazId: event.target.value, stanId: '' }))
  }

  function validateForm() {
    if (!form.ulazId) {
      return 'Izaberite ulaz.'
    }
    if (!form.stanId) {
      return 'Izaberite stan.'
    }
    if (form.password !== form.confirmPassword) {
      return 'Sifre se ne poklapaju.'
    }
    if (passwordScore < 5) {
      return 'Sifra mora imati najmanje 8 karaktera, veliko slovo, malo slovo, broj i specijalni karakter.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      showToast(validationError, 'warning')
      return
    }

    setError('')
    setLoading(true)
    try {
      const email = form.email.trim().toLowerCase()
      await register({
        ime: form.ime.trim(),
        prezime: form.prezime.trim(),
        email,
        ulazId: Number(form.ulazId),
        stanId: Number(form.stanId),
        password: form.password,
        confirmPassword: form.confirmPassword,
        roleCode: 1,
      })
      await login({ email, password: form.password })
      showToast('Nalog je kreiran i prijavljeni ste.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = getApiMessage(err)
      setError(message)
      showToast(message, err?.response?.status === 409 ? 'warning' : 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel-wide">
        <div className="auth-brand">
          <div className="auth-brand-icon"><ShieldCheck size={24} /></div>
          <div>
            <h1>Registracija</h1>
            <p>Kreirajte nalog sa jakom sifrom i potvrdom unosa.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <ErrorMessage message={error} />
          <div className="form-grid two">
            <FormInput label="Ime" name="ime" value={form.ime} onChange={updateField} autoComplete="given-name" required />
            <FormInput label="Prezime" name="prezime" value={form.prezime} onChange={updateField} autoComplete="family-name" required />
          </div>
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
          <div className="form-grid two">
            <FormSelect
              label="Ulaz"
              name="ulazId"
              value={form.ulazId}
              onChange={updateUlaz}
              options={ulazi}
              placeholder={lookupLoading ? 'Ucitavanje ulaza...' : 'Izaberi ulaz'}
              required
            />
            <FormSelect
              label="Stan"
              name="stanId"
              value={form.stanId}
              onChange={updateField}
              options={stanovi}
              placeholder={!form.ulazId ? 'Prvo izaberi ulaz' : lookupLoading ? 'Ucitavanje stanova...' : 'Izaberi stan'}
              disabled={!form.ulazId || lookupLoading}
              required
            />
          </div>
          <FormInput label="Sifra" name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" required />
          <div className="password-meter" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={index < passwordScore ? 'active' : ''} />
            ))}
          </div>
          <FormInput label="Ponovi sifru" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" required />
          <Button type="submit" icon={UserPlus} loading={loading} fullWidth>Registruj se</Button>
        </form>

        <div className="auth-footer">
          <span>Vec imas nalog?</span>
          <Link to="/login" className="auth-footer-link"><LogIn size={16} /> Prijavi se</Link>
        </div>
      </section>
    </main>
  )
}
