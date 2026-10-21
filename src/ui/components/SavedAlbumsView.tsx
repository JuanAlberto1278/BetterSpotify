import { useLibraryStatus } from '../../data/libraryStore';
import { useSavedAlbums } from '../../data/useLibrary';
import { DiscIcon } from '../icons';
import AlbumGrid from './AlbumGrid';
import styles from './View.module.css';

export default function SavedAlbumsView() {
  const allAlbums = useSavedAlbums();

  // Lo que quitás con el ♥ (desde un álbum) desaparece sin recargar la lista.
  const isSaved = useLibraryStatus(allAlbums.items.map((a) => a.uri));
  const albums = { ...allAlbums, items: allAlbums.items.filter((a) => isSaved(a.uri) !== false) };
  const removed = allAlbums.items.length - albums.items.length;
  const total = allAlbums.total !== null ? allAlbums.total - removed : null;

  return (
    <section>
      <header className={styles.header}>
        <div className={`${styles.cover} ${styles.likedCover}`}>
          <DiscIcon size={64} />
        </div>
        <div className={styles.headerText}>
          <p className={styles.kicker}>Biblioteca</p>
          <h1 className={styles.title}>Tus álbumes</h1>
          <p className={styles.meta}>
            {total !== null && `${total} ${total === 1 ? 'álbum' : 'álbumes'}`}
          </p>
        </div>
      </header>

      <AlbumGrid
        list={albums}
        subtitle="artists"
        emptyText="Todavía no guardaste álbumes. Tocá el ♥ en cualquier álbum para agregarlo acá."
      />
    </section>
  );
}
