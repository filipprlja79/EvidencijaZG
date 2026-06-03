/*
 * Komentar projekta: Reusable UI komponenta koja daje jedinstven izgled dugmadi, modala, tabela i poruka.
 */

import Button from './Button.jsx'
import Modal from './Modal.jsx'

export default function ConfirmDialog({
  open,
  title = 'Potvrda akcije',
  message = 'Da li ste sigurni da želite nastaviti?',
  confirmLabel = 'Obriši',
  cancelLabel = 'Odustani',
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={message}
      onClose={onCancel}
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel}> {cancelLabel}</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}
    />
  )
}

