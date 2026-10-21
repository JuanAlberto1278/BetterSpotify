import type { ReactNode } from 'react';
import type { SearchResults } from '../../api/search';
import { staticList } from '../../data/usePagedList';
import { useDebouncedValue, useSearchAll, useSearchList } from '../../data/useSearch';
import { usePlayer } from '../../player/usePlayer';
import { navigate } from '../../router/router';
import { paths, type SearchTab } from '../../router/routes';
import AlbumGrid from './AlbumGrid';
import ArtistGrid from './ArtistGrid';
import Link from './Link';
import PlaylistGrid from './PlaylistGrid';
import TrackList from './TrackList';
import styles from './View.module.css';

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'tracks', label: 'Canciones' },
  { id: 'artists', label: 'Artistas' },
  { id: 'albums', label: 'Álbumes' },
  { id: 'playlists', label: 'Playlists' },
];

/** Cuántos elementos mostrar por sección en la pestaña "Todo". */
const PREVIEW = { tracks: 5, cards: 6 };

/** Resultados de búsqueda. El campo de texto vive en la barra superior. */
export default function SearchView({ query, tab }: { query: string; tab: SearchTab }) {
  const debouncedQuery = useDebouncedValue(query.trim());

  if (!debouncedQuery) {
    return (
      <section>
        <h1 className={styles.pageTitle}>Buscar</h1>
        <p className={styles.meta}>
          Escribí en el buscador de arriba: canciones, artistas, álbumes o playlists.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className={styles.tabs} role="tablist" aria-label="Tipo de resultado">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab}
            className={`${styles.tab} ${t.id === tab ? styles.tabActive : ''}`}
            onClick={() => navigate(paths.search(query, t.id))}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && <AllResults query={debouncedQuery} />}
      {tab === 'tracks' && <TrackResults query={debouncedQuery} />}
      {tab === 'artists' && <ArtistResults query={debouncedQuery} />}
      {tab === 'albums' && <AlbumResults query={debouncedQuery} />}
      {tab === 'playlists' && <PlaylistResults query={debouncedQuery} />}
    </section>
  );
}

// ── Pestaña "Todo": un poco de cada tipo ────────────────────────────────────

function AllResults({ query }: { query: string }) {
  const results = useSearchAll(query);
  const { playTracks } = usePlayer();
  const data = results.data;

  if (results.error) {
    return (
      <p className={styles.error}>
        {results.error} <button onClick={results.reload}>Reintentar</button>
      </p>
    );
  }
  if (!data) return <p className={styles.meta}>Buscando…</p>;
  if (isEmpty(data)) return <p className={styles.meta}>Sin resultados para “{query}”.</p>;

  const tracks = data.tracks.items;

  return (
    <>
      {tracks.length > 0 && (
        <ResultSection title="Canciones" query={query} tab="tracks">
          <TrackList
            list={staticList(tracks.slice(0, PREVIEW.tracks))}
            // Se encolan las 10 primeras para que "siguiente" avance por ellas.
            onPlay={(index) => playTracks(tracks.map((t) => t.uri), index)}
          />
        </ResultSection>
      )}
      {data.artists.items.length > 0 && (
        <ResultSection title="Artistas" query={query} tab="artists">
          <ArtistGrid list={staticList(data.artists.items.slice(0, PREVIEW.cards))} />
        </ResultSection>
      )}
      {data.albums.items.length > 0 && (
        <ResultSection title="Álbumes" query={query} tab="albums">
          <AlbumGrid list={staticList(data.albums.items.slice(0, PREVIEW.cards))} subtitle="artists" />
        </ResultSection>
      )}
      {data.playlists.items.length > 0 && (
        <ResultSection title="Playlists" query={query} tab="playlists">
          <PlaylistGrid list={staticList(data.playlists.items.slice(0, PREVIEW.cards))} />
        </ResultSection>
      )}
    </>
  );
}

function isEmpty(data: SearchResults): boolean {
  return [data.tracks, data.artists, data.albums, data.playlists].every((p) => p.items.length === 0);
}

function ResultSection({
  title,
  query,
  tab,
  children,
}: {
  title: string;
  query: string;
  tab: SearchTab;
  children: ReactNode;
}) {
  return (
    <section className={styles.resultSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Link to={paths.search(query, tab)} className={styles.seeAll}>
          Ver todo
        </Link>
      </div>
      {children}
    </section>
  );
}

// ── Pestañas de un solo tipo, con scroll infinito ───────────────────────────

function TrackResults({ query }: { query: string }) {
  const list = useSearchList(query, 'track');
  const { playTracks } = usePlayer();
  return (
    <TrackList
      list={list}
      // Se encolan los resultados cargados para que "siguiente" avance por ellos.
      onPlay={(index) => playTracks(list.items.map((t) => t.uri), index)}
      emptyText={`Sin canciones para “${query}”.`}
    />
  );
}

function ArtistResults({ query }: { query: string }) {
  return <ArtistGrid list={useSearchList(query, 'artist')} emptyText={`Sin artistas para “${query}”.`} />;
}

function AlbumResults({ query }: { query: string }) {
  return (
    <AlbumGrid list={useSearchList(query, 'album')} subtitle="artists" emptyText={`Sin álbumes para “${query}”.`} />
  );
}

function PlaylistResults({ query }: { query: string }) {
  return <PlaylistGrid list={useSearchList(query, 'playlist')} />;
}
