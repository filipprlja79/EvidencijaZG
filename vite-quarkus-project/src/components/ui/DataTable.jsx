import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import EmptyState from './EmptyState.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'
import Button from './Button.jsx'

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle = 'Nema podataka',
  emptyDescription = 'Trenutno nema zapisa za prikaz.',
  emptyAction,
}) {
  const scrollRef = useRef(null)

  function moveTable(direction) {
    const element = scrollRef.current
    if (!element) return
    element.scrollBy({
      left: direction * Math.max(280, element.clientWidth * 0.75),
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <div className="table-card table-state">
        <LoadingSpinner label="Učitavanje podataka..." />
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="table-card table-state">
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    )
  }

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <span>Pomjeraj podatke strelicama</span>
        <div>
          <Button variant="secondary" size="icon" aria-label="Tabela lijevo" icon={ChevronLeft} onClick={() => moveTable(-1)} />
          <Button variant="secondary" size="icon" aria-label="Tabela desno" icon={ChevronRight} onClick={() => moveTable(1)} />
        </div>
      </div>
      <div className="table-scroll" ref={scrollRef}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.align === 'right' ? 'text-right' : ''}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align === 'right' ? 'text-right' : ''}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
