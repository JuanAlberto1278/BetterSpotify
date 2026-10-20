import { useTrackSearch } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { navigate } from '../../router/router';
import { paths } from '../../router/routes';
import TrackList from './TrackList';
import styles from './View.module.css';

export const SEARCH_INPUT_ID = 'search-input';

export default function SearchView({ query }: { query: string }) {
  const results = useTrackSearch(query);
  const { playTracks } = usePlayer();

  return (
    <section>
      <input
        id={SEARCH_INPUT_ID}
        className={styles.search}
        type="search"
        placeholder="¿Qué querés escuchar?"
        value={query}
        // replace: escribir no llena el historial; "atrás" vuelve a la vista anterior.
        onChange={(e) => navigate(paths.search(e.target.value), { replace: true })}
        autoFocus
      />

      {results.debouncedQuery ? (
        <TrackList
          list={results}
          // Se encolan los resultados cargados para que "siguiente" avance por ellos.
          onPlay={(index) => playTracks(results.items.map((t) => t.uri), index)}
          emptyText={`Sin resultados para “${results.debouncedQuery}”.`}
        />
      ) : (
        <p className={styles.meta}>Buscá canciones por nombre, artista o álbum.</p>
      )}
    </section>
  );
}
