import { useTrackSearch } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import TrackList from './TrackList';
import styles from './View.module.css';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function SearchView({ query, onQueryChange }: Props) {
  const results = useTrackSearch(query);
  const { playTracks } = usePlayer();

  return (
    <section>
      <input
        className={styles.search}
        type="search"
        placeholder="¿Qué querés escuchar?"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
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
