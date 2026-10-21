import { SHORTCUTS } from '../../player/useKeyboardShortcuts';
import Dialog from './Dialog';
import styles from './ShortcutsDialog.module.css';

/** Diálogo con la lista de atajos de teclado. */
export default function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Atajos de teclado">
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
    </Dialog>
  );
}
