export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} type={type} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="btn-spinner" /> : Icon ? <Icon size={16} /> : null}
      <span>{children}</span>
    </button>
  )
}
