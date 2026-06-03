/*
 * Komentar projekta: Reusable UI komponenta koja daje jedinstven izgled dugmadi, modala, tabela i poruka.
 */

import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export default function Toast({ message, type = 'success' }) {
  const Icon = iconMap[type] || iconMap.info
  return (
    <div className={`toast toast-${type}`}>
      <Icon size={18} />
      <span>{message}</span>
    </div>
  )
}

