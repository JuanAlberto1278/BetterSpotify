import { useState } from 'react';
import type { DiscographyGroup } from '../../api/artists';
import { useArtist, useArtistAlbums } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { ArtistIcon, PlayIcon } from '../icons';
import { pickImage } from '../images';
import AlbumGrid from './AlbumGrid';
import styles from './View.module.css';

const TABS: { id: string; label: string; groups: DiscographyGroup[] }[] = [
  { id: 'albums', label: 'Álbumes', groups: ['album', 'compilation'] },
  { id: 'singles', label: 'Sencillos y EP', groups: ['single'] },
  { id: 'appears', label: 'Aparece en', groups: ['appears_on'] },
];

export default function ArtistView({ artistId }: { artistId: string }) {
  const artist = useArtist(artistId);
  const [tabId, setTabId] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === tabId) ?? TABS[0];
  const albums = useArtistAlbums(artistId, tab.groups);
  const { playContext } = usePlayer();

  const info = artist.data?.id === artistId ? artist.data : null;
  const uri = info?.uri ?? `spotify:artist:${artistId}`;
  const image = pickImage(info?.images, 160);

  return (
    <section>
      <header className={styles.header}>
        {image ? (
          <img className={`${styles.cover} ${styles.round}`} src={image} alt="" />
        ) : (
          <div className={`${styles.cover} ${styles.round} ${styles.placeholder}`}>
            <ArtistIcon size={64} />
          </div>
        )}
        <div className={styles.headerText}>
          <p className={styles.kicker}>Artista</p>
          <h1 className={styles.title}>{info?.name ?? (artist.loading ? 'Cargando…' : 'Artista')}</h1>
          {info?.genres && info.genres.length > 0 && (
            <p className={styles.meta}>{info.genres.slice(0, 3).join(' · ')}</p>
          )}
          <div className={styles.actions}>
            {/* Spotify elige qué sonar del artista (sus canciones más populares). */}
            <button className={styles.playAll} onClick={() => playContext(uri)}>
              <PlayIcon size={16} /> Reproducir
            </button>
          </div>
        </div>
      </header>

      {artist.error && <p className={styles.error}>{artist.error}</p>}

      <div className={styles.tabs} role="tablist" aria-label="Discografía">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab.id}
            className={`${styles.tab} ${t.id === tab.id ? styles.tabActive : ''}`}
            onClick={() => setTabId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AlbumGrid list={albums} emptyText="No hay nada en esta sección." />
    </section>
  );
}
