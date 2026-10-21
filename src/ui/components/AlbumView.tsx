import { useAlbum } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { ALBUM_TYPE_LABEL } from '../format';
import { DiscIcon, PlayIcon } from '../icons';
import { pickImage } from '../images';
import ArtistLinks from './ArtistLinks';
import SaveButton from './SaveButton';
import TrackList from './TrackList';
import styles from './View.module.css';

export default function AlbumView({ albumId }: { albumId: string }) {
  const { album, tracks } = useAlbum(albumId);
  const { playContext } = usePlayer();

  const info = album.data?.id === albumId ? album.data : null;
  const uri = info?.uri ?? `spotify:album:${albumId}`;
  const cover = pickImage(info?.images, 160);

  return (
    <section>
      <header className={styles.header}>
        {cover ? (
          <img className={styles.cover} src={cover} alt="" />
        ) : (
          <div className={`${styles.cover} ${styles.placeholder}`}>
            <DiscIcon size={64} />
          </div>
        )}
        <div className={styles.headerText}>
          <p className={styles.kicker}>{info ? ALBUM_TYPE_LABEL[info.album_type] : 'Álbum'}</p>
          <h1 className={styles.title}>{info?.name ?? (album.loading ? 'Cargando…' : 'Álbum')}</h1>
          {info && (
            <p className={styles.meta}>
              <ArtistLinks artists={info.artists} className={styles.metaLink} />
              {' · '}
              {info.release_date.slice(0, 4)}
              {' · '}
              {info.total_tracks} {info.total_tracks === 1 ? 'canción' : 'canciones'}
            </p>
          )}
          <div className={styles.actions}>
            <button className={styles.playAll} onClick={() => playContext(uri)}>
              <PlayIcon size={16} /> Reproducir
            </button>
            <SaveButton uri={uri} kind="álbum" size={28} />
          </div>
        </div>
      </header>

      {album.error && <p className={styles.error}>{album.error}</p>}

      <TrackList
        list={tracks}
        variant="album"
        onPlay={(index) => playContext(uri, { trackUri: tracks.items[index].uri })}
        emptyText="Este álbum no tiene canciones reproducibles."
      />
    </section>
  );
}
