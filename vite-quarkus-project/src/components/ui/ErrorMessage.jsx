/*
 * Komentar projekta: Reusable UI komponenta koja daje jedinstven izgled dugmadi, modala, tabela i poruka.
 */

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

