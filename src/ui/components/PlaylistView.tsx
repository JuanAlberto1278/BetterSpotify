import { useState } from 'react';
import { describeError } from '../../api/errors';
import { canEditPlaylist, type PlaylistDetails } from '../../api/playlists';
import type { Track } from '../../api/types';
import { useAuth } from '../../auth/useAuth';
import { editPlaylistDetails, removeTracksFromPlaylist } from '../../data/playlistStore';
import { usePlaylist, usePlaylistTracks } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { decodeHtml } from '../format';
import { EditIcon, PlayIcon, PlaylistIcon } from '../icons';
import { pickImage } from '../images';
import PlaylistDialog from './PlaylistDialog';
import TrackList from './TrackList';
import styles from './View.module.css';

export default function PlaylistView({ playlistId }: { playlistId: string }) {
  const { user } = useAuth();
  const playlist = usePlaylist(playlistId);
  const allTracks = usePlaylistTracks(playlistId);
  const { playContext, notify } = usePlayer();
  const [editing, setEditing] = useState(false);
  // Lo quitado se oculta al instante, sin recargar la lista (no se pierde el scroll).
  const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set());

  const info = playlist.data;
  const uri = info?.uri ?? `spotify:playlist:${playlistId}`;
  const cover = pickImage(info?.images, 160);
  const editable = info ? canEditPlaylist(info, user?.id) : false;
  // En modo desarrollo Spotify no lista el contenido de playlists ajenas, pero sí se pueden reproducir.
  const isForeign = info && user && !editable;

  const tracks = { ...allTracks, items: allTracks.items.filter((t) => !removed.has(t.uri)) };
  const removedCount = allTracks.items.length - tracks.items.length;
  const total = allTracks.total !== null ? allTracks.total - removedCount : null;

  const remove = (track: Track) => {
    setRemoved((prev) => new Set(prev).add(track.uri));
    removeTracksFromPlaylist(playlistId, [track.uri])
      .then(() => notify('info', `Quitada de “${info?.name ?? 'la playlist'}”`))
      .catch((err) => {
        setRemoved((prev) => {
          const next = new Set(prev);
          next.delete(track.uri);
          return next;
        });
        notify('error', describeError(err));
      });
  };

  const saveDetails = async (details: PlaylistDetails) => {
    await editPlaylistDetails(playlistId, details);
    setEditing(false);
    notify('info', 'Playlist actualizada');
  };

  return (
    <section>
      <header className={styles.header}>
        {cover ? (
          <img className={styles.cover} src={cover} alt="" />
        ) : (
          <div className={`${styles.cover} ${styles.placeholder}`}>
            <PlaylistIcon size={64} />
          </div>
        )}
        <div className={styles.headerText}>
          <p className={styles.kicker}>
            {info?.public === false ? 'Playlist privada' : 'Playlist'}
            {info?.collaborative && ' · colaborativa'}
          </p>
          <h1 className={styles.title}>{info?.name ?? (playlist.loading ? 'Cargando…' : 'Playlist')}</h1>
          {info?.description && <p className={styles.description}>{decodeHtml(info.description)}</p>}
          <p className={styles.meta}>
            {info && (info.owner.display_name ?? info.owner.id)}
            {total !== null && ` · ${total} canciones`}
          </p>
          <div className={styles.actions}>
            <button className={styles.playAll} onClick={() => playContext(uri)}>
              <PlayIcon size={16} /> Reproducir
            </button>
            {editable && (
              <button className={styles.secondaryAction} onClick={() => setEditing(true)}>
                <EditIcon size={16} /> Editar
              </button>
            )}
          </div>
        </div>
      </header>

      {playlist.error && <p className={styles.error}>{playlist.error}</p>}
      {isForeign && allTracks.error && (
        <p className={styles.meta}>
          Spotify solo permite ver las canciones de playlists tuyas o colaborativas en apps en modo
          desarrollo. Igual podés reproducirla con el botón de arriba.
        </p>
      )}

      <TrackList
        list={tracks}
        // Reproducir dentro del contexto de la playlist: anterior/siguiente la siguen.
        onPlay={(index) => playContext(uri, { trackUri: tracks.items[index].uri })}
        onRemove={editable ? remove : undefined}
        playlistId={playlistId}
        emptyText={
          editable
            ? 'Esta playlist está vacía. Agregá canciones desde el menú ⋯ de cualquier canción.'
            : 'Esta playlist no tiene canciones reproducibles.'
        }
      />

      {info && (
        <PlaylistDialog
          open={editing}
          onClose={() => setEditing(false)}
          initial={{
            name: info.name,
            description: info.description ? decodeHtml(info.description) : '',
            public: info.public ?? false,
          }}
          onSubmit={saveDetails}
        />
      )}
    </section>
  );
}
