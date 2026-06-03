/*
 * Komentar projekta: Reusable form komponenta koja standardizuje unos podataka u formama.
 */

export default function FormCheckbox({ label, checked, onChange, error }) {
  return (
    <label className="form-checkbox">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
      {error ? <small>{error}</small> : null}
    </label>
  )
}

