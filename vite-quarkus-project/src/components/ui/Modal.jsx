import { X } from 'lucide-react'
import Button from './Button.jsx'

export default function Modal({ open, title, description, children, footer, onClose }) {
  if (!open) return null

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" aria-label="Zatvori" onClick={onClose} icon={X} />
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </section>
    </div>
  )
}
