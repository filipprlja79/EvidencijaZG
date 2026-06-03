/*
 * Komentar projekta: Reusable UI komponenta koja daje jedinstven izgled dugmadi, modala, tabela i poruka.
 */

export default function LoadingSpinner({ label = 'Učitavanje...' }) {
  return (
    <div className="loading-spinner" role="status">
      <span />
      <p>{label}</p>
    </div>
  )
}

