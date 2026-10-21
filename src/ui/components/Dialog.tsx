import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CloseIcon } from '../icons';
import styles from './Dialog.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Diálogo modal sobre <dialog> nativo: Escape y clic en el fondo lo cierran. */
export default function Dialog({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() enfoca el primer botón (la ✕); si hay un campo, mejor ese.
      dialog.querySelector<HTMLElement>('input, textarea, select')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby={titleId}
    >
      {/* Solo se monta el contenido abierto: los formularios arrancan limpios. */}
      {open && (
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button className={styles.close} onClick={onClose} aria-label="Cerrar">
              <CloseIcon size={18} />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
