/*
 * Komentar projekta: Login stranica aplikacije.
 */

import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { getApiMessage } from '../api/axiosClient.js'
import FormInput from '../components/forms/FormInput.jsx'
import Button from '../components/ui/Button.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      showToast('Uspjesno ste prijavljeni.', 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = getApiMessage(err)
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="auth-brand-icon"><LockKeyhole size={24} /></div>
          <div>
            <h1>Prijava</h1>
            <p>Unesite email i sifru za pristup nalogu.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <ErrorMessage message={error} />
          <FormInput label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required />
          <FormInput label="Sifra" name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateField} required />
          <Button type="submit" icon={LogIn} loading={loading} fullWidth>Prijavi se</Button>
        </form>

        <div className="auth-footer">
          <Mail size={16} />
          <span>Nemas nalog?</span>
          <Link to="/register">Registruj se</Link>
        </div>
      </section>
    </main>
  )
}
