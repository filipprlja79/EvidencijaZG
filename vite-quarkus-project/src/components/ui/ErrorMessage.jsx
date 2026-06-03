import { AlertTriangle } from 'lucide-react'

export default function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div className="error-message" role="alert">
      <AlertTriangle size={18} />
      <span>{message}</span>
    </div>
  )
}
