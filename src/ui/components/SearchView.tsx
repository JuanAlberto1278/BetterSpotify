import { useTrackSearch } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import TrackList from './TrackList';
import styles from './View.module.css';

/** Resultados de búsqueda. El campo de texto vive en la barra superior. */
export default function SearchView({ query }: { query: string }) {
  const results = useTrackSearch(query);
  const { playTracks } = usePlayer();

  return (
    <section>
      {results.debouncedQuery ? (
        <>
          <h1 className={styles.pageTitle}>Resultados para “{results.debouncedQuery}”</h1>
          <TrackList
            list={results}
            // Se encolan los resultados cargados para que "siguiente" avance por ellos.
            onPlay={(index) => playTracks(results.items.map((t) => t.uri), index)}
            emptyText={`Sin resultados para “${results.debouncedQuery}”.`}
          />
        </>
      ) : (
        <>
          <h1 className={styles.pageTitle}>Buscar</h1>
          <p className={styles.meta}>Escribí en el buscador de arriba: canciones por nombre, artista o álbum.</p>
        </>
      )}
    </section>
  );
}
