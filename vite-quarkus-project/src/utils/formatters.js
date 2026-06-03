export function fullName(stanar) {
  return [stanar?.ime, stanar?.prezime].filter(Boolean).join(' ') || '-'
}

export function money(value) {
  return new Intl.NumberFormat('sr-ME', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export function date(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('sr-ME', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function statusVariant(status) {
  if (status === 'Plaćeno' || status === 'Aktivno') return 'success'
  if (status === 'Djelimično') return 'warning'
  if (status === 'Nije plaćeno' || status === 'Arhivirano') return 'danger'
  return 'neutral'
}

export function compactId(prefix, id) {
  return `${prefix}-${String(id).padStart(3, '0')}`
}

export function nextLocalId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id || 0))) + 1
}
