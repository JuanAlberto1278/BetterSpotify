import { useAuth } from '../../auth/useAuth';
import { usePlaylist, usePlaylistTracks } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { PlayIcon } from '../icons';
import { pickImage } from '../images';
import TrackList from './TrackList';
import styles from './View.module.css';

export default function PlaylistView({ playlistId }: { playlistId: string }) {
  const { user } = useAuth();
  const playlist = usePlaylist(playlistId);
  const tracks = usePlaylistTracks(playlistId);
  const { playContext } = usePlayer();

  const info = playlist.data;
  const uri = info?.uri ?? `spotify:playlist:${playlistId}`;
  const cover = pickImage(info?.images, 160);
  // En modo desarrollo Spotify no lista el contenido de playlists ajenas, pero sí se pueden reproducir.
  const isForeign = info && user && info.owner.id !== user.id && !info.collaborative;

  return (
    <section>
      <header className={styles.header}>
        {cover ? <img className={styles.cover} src={cover} alt="" /> : <div className={styles.cover} />}
        <div>
          <p className={styles.kicker}>Playlist</p>
          <h1 className={styles.title}>{info?.name ?? (playlist.loading ? 'Cargando…' : 'Playlist')}</h1>
          <p className={styles.meta}>
            {info && (info.owner.display_name ?? info.owner.id)}
            {tracks.total !== null && ` · ${tracks.total} canciones`}
          </p>
          <button className={styles.playAll} onClick={() => playContext(uri)}>
            <PlayIcon size={16} /> Reproducir
          </button>
        </div>
      </header>

      {playlist.error && <p className={styles.error}>{playlist.error}</p>}
      {isForeign && tracks.error && (
        <p className={styles.meta}>
          Spotify solo permite ver las canciones de playlists tuyas o colaborativas en apps en modo
          desarrollo. Igual podés reproducirla con el botón de arriba.
        </p>
      )}

      <TrackList
        list={tracks}
        // Reproducir dentro del contexto de la playlist: anterior/siguiente la siguen.
        onPlay={(index) => playContext(uri, { trackUri: tracks.items[index].uri })}
        emptyText="Esta playlist no tiene canciones reproducibles."
      />
    </section>
  );
}
