/*
 * Komentar projekta: Reusable form komponenta koja standardizuje unos podataka u formama.
 */

export default function FormSelect({ label, error, options = [], placeholder = 'Izaberi...', className = '', ...props }) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      <select className={error ? 'has-error' : ''} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error ? <small>{error}</small> : null}
    </label>
  )
}

