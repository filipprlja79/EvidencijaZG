/*
 * Komentar projekta: Reusable UI komponenta koja daje jedinstven izgled dugmadi, modala, tabela i poruka.
 */

export default function StatCard({ icon: Icon, label, value, trend, tone = 'primary' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-${tone}`}>
        {Icon ? <Icon size={20} /> : null}
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {trend ? <span>{trend}</span> : null}
      </div>
    </article>
  )
}

