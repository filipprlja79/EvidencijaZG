import { Search } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'Pretraži...', className = '' }) {
  return (
    <label className={`search-input ${className}`}>
      <Search size={18} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}
