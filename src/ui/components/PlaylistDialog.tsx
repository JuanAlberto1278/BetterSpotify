import { useState, type FormEvent } from 'react';
import { describeError } from '../../api/errors';
import type { PlaylistDetails } from '../../api/playlists';
import Dialog from './Dialog';
import styles from './PlaylistDialog.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Con `initial` es edición; sin él, creación. */
  initial?: PlaylistDetails;
  /** Debe lanzar si falla: el error se muestra en el diálogo. */
  onSubmit: (details: PlaylistDetails) => Promise<void>;
}

/** Crear o editar una playlist (nombre, descripción, pública/privada). */
export default function PlaylistDialog({ open, onClose, initial, onSubmit }: Props) {
  const editing = Boolean(initial);
  return (
    <Dialog open={open} onClose={onClose} title={editing ? 'Editar playlist' : 'Nueva playlist'}>
      <PlaylistForm initial={initial} onCancel={onClose} onSubmit={onSubmit} />
    </Dialog>
  );
}

function PlaylistForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: PlaylistDetails;
  onCancel: () => void;
  onSubmit: Props['onSubmit'];
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  // Por defecto privada: es una app personal.
  const [isPublic, setIsPublic] = useState(initial?.public ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    onSubmit({ name: name.trim(), description: description.trim(), public: isPublic })
      .catch((err) => setError(describeError(err)))
      .finally(() => setSaving(false));
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span>Nombre</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          autoFocus
          placeholder="Mi playlist"
        />
      </label>
      <label className={styles.field}>
        <span>Descripción (opcional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
        />
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        <span>Pública (aparece en tu perfil de Spotify)</span>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.primary} disabled={saving || !name.trim()}>
          {saving ? 'Guardando…' : initial ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
