// Confirm dialog
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { AlertTriangle } from 'lucide-react';
import useUIStore from '../../stores/uiStore.js';

export function ConfirmDialog() {
  const confirmDialog = useUIStore((s) => s.confirmDialog);
  if (!confirmDialog) return null;
  const { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel } = confirmDialog;
  return (
    <Modal open onClose={onCancel} title={title || 'Confirm Action'} size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex gap-3 items-start">
        <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </Modal>
  );
}
