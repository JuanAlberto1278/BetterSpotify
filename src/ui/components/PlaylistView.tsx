import { getPlaylistTotal } from '../../api/playlists';
import type { SimplifiedPlaylist } from '../../api/types';
import { usePlaylistTracks } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { pickImage } from '../images';
import TrackList from './TrackList';
import styles from './View.module.css';

export default function PlaylistView({ playlist }: { playlist: SimplifiedPlaylist }) {
  const tracks = usePlaylistTracks(playlist.id);
  const { playContext } = usePlayer();
  const total = getPlaylistTotal(playlist);
  const cover = pickImage(playlist.images, 160);

  return (
    <section>
      <header className={styles.header}>
        {cover ? <img className={styles.cover} src={cover} alt="" /> : <div className={styles.cover} />}
        <div>
          <p className={styles.kicker}>Playlist</p>
          <h1 className={styles.title}>{playlist.name}</h1>
          <p className={styles.meta}>
            {playlist.owner.display_name ?? playlist.owner.id}
            {total !== null && ` · ${total} canciones`}
          </p>
          <button
            className={styles.playAll}
            onClick={() => playContext(playlist.uri)}
            disabled={tracks.items.length === 0}
          >
            ▶ Reproducir
          </button>
        </div>
      </header>

      <TrackList
        list={tracks}
        // Reproducir dentro del contexto de la playlist: anterior/siguiente la siguen.
        onPlay={(index) => playContext(playlist.uri, tracks.items[index].uri)}
        emptyText="Esta playlist no tiene canciones reproducibles."
      />
    </section>
  );
}
