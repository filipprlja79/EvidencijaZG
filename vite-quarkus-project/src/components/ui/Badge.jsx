const variantMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
}

export default function Badge({ children, variant = 'neutral' }) {
  return <span className={`badge ${variantMap[variant] || variantMap.neutral}`}>{children}</span>
}
