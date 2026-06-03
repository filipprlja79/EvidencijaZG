export default function LoadingSpinner({ label = 'Učitavanje...' }) {
  return (
    <div className="loading-spinner" role="status">
      <span />
      <p>{label}</p>
    </div>
  )
}
