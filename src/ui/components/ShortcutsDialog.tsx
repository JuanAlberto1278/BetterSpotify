import { useEffect, useRef } from 'react';
import { SHORTCUTS } from '../../player/useKeyboardShortcuts';
import { CloseIcon } from '../icons';
import styles from './ShortcutsDialog.module.css';

/** Diálogo modal con la lista de atajos de teclado (usa <dialog> nativo). */
export default function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      // Clic en el fondo (fuera del contenido) cierra.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="shortcuts-title"
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="shortcuts-title" className={styles.title}>
            Atajos de teclado
          </h2>
          <button className={styles.close} onClick={onClose} aria-label="Cerrar">
            <CloseIcon size={18} />
          </button>
        </header>
        <dl className={styles.list}>
          {SHORTCUTS.map(({ keys, action }) => (
            <div key={keys} className={styles.row}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}
