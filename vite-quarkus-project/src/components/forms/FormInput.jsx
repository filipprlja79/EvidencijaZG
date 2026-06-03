export default function FormInput({ label, error, className = '', as = 'input', ...props }) {
  const Field = as
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      <Field className={error ? 'has-error' : ''} {...props} />
      {error ? <small>{error}</small> : null}
    </label>
  )
}
