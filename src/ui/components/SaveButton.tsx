import { describeError } from '../../api/errors';
import { setInLibrary, useLibraryStatus } from '../../data/libraryStore';
import { usePlayer } from '../../player/usePlayer';
import { HeartIcon, HeartOutlineIcon } from '../icons';
import styles from './SaveButton.module.css';

interface Props {
  uri: string;
  /** Para los textos: "canción", "álbum"... */
  kind?: string;
  size?: number;
  className?: string;
}

/** ♥ para guardar / quitar de tu biblioteca. Funciona con canciones y álbumes. */
export default function SaveButton({ uri, kind = 'canción', size = 16, className = '' }: Props) {
  const isSaved = useLibraryStatus([uri]);
  const { notify } = usePlayer();
  const saved = isSaved(uri) === true;

  const toggle = () => {
    const next = !saved;
    setInLibrary(uri, next)
      .then(() => notify('info', next ? 'Agregada a Tu biblioteca' : 'Quitada de Tu biblioteca'))
      .catch((err) => notify('error', describeError(err)));
  };

  const label = saved ? `Quitar ${kind} de Tu biblioteca` : `Guardar ${kind} en Tu biblioteca`;

  return (
    <button
      className={`${styles.button} ${saved ? styles.saved : ''} ${className}`}
      onClick={toggle}
      onDoubleClick={(e) => e.stopPropagation()}
      aria-label={label}
      aria-pressed={saved}
      title={label}
    >
      {saved ? <HeartIcon size={size} /> : <HeartOutlineIcon size={size} />}
    </button>
  );
}
