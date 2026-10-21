import { useState } from 'react';
import { describeError } from '../../api/errors';
import { canEditPlaylist, type PlaylistDetails } from '../../api/playlists';
import type { Track } from '../../api/types';
import { useAuth } from '../../auth/useAuth';
import { addTracksToPlaylist, createPlaylistWith } from '../../data/playlistStore';
import { usePlaylists } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { navigate } from '../../router/router';
import { paths } from '../../router/routes';
import { ArtistIcon, DiscIcon, MoreIcon, PlaylistIcon, PlusIcon, QueueIcon, TrashIcon } from '../icons';
import { pickImage } from '../images';
import Menu, { MenuHeading, MenuItem, MenuSeparator } from './Menu';
import PlaylistDialog from './PlaylistDialog';
import styles from './TrackMenu.module.css';

interface Props {
  track: Track;
  /** Si está, aparece "Quitar de esta playlist". */
  onRemove?: () => void;
  /** Para no ofrecer agregarla a la playlist donde ya estás. */
  currentPlaylistId?: string;
  className?: string;
}

/** Menú "⋯" de una canción. */
export default function TrackMenu({ track, onRemove, currentPlaylistId, className = '' }: Props) {
  const { addToQueue, notify } = usePlayer();
  const [creating, setCreating] = useState(false);
  const artist = track.artists[0];

  const createWithTrack = async (details: PlaylistDetails) => {
    const playlist = await createPlaylistWith(details, [track.uri]);
    setCreating(false);
    notify('info', `Playlist “${playlist.name}” creada`);
    navigate(paths.playlist(playlist.id));
  };

  return (
    <>
      <Menu
        label={`Más opciones para ${track.name}`}
        align="right"
        triggerClassName={`${styles.trigger} ${className}`}
        trigger={<MoreIcon size={16} />}
      >
        {(close) => (
          <>
            <MenuItem
              icon={<QueueIcon size={18} />}
              onSelect={() => {
                close();
                addToQueue(track.uri);
              }}
            >
              Agregar a la cola
            </MenuItem>
            {track.album.id && (
              <MenuItem icon={<DiscIcon size={18} />} to={paths.album(track.album.id)} onSelect={close}>
                Ir al álbum
              </MenuItem>
            )}
            {artist?.id && (
              <MenuItem icon={<ArtistIcon size={18} />} to={paths.artist(artist.id)} onSelect={close}>
                Ir al artista
              </MenuItem>
            )}
            {onRemove && (
              <MenuItem
                icon={<TrashIcon size={18} />}
                onSelect={() => {
                  close();
                  onRemove();
                }}
              >
                Quitar de esta playlist
              </MenuItem>
            )}

            <MenuSeparator />
            <MenuHeading>Agregar a playlist</MenuHeading>
            <MenuItem
              icon={<PlusIcon size={18} />}
              onSelect={() => {
                close();
                setCreating(true);
              }}
            >
              Nueva playlist…
            </MenuItem>
            <EditablePlaylists
              track={track}
              excludeId={currentPlaylistId}
              onDone={(message, kind = 'info') => {
                close();
                notify(kind, message);
              }}
            />
          </>
        )}
      </Menu>

      <PlaylistDialog open={creating} onClose={() => setCreating(false)} onSubmit={createWithTrack} />
    </>
  );
}

/** Playlists donde el usuario puede agregar (suyas o colaborativas). Se pide al abrir el menú. */
function EditablePlaylists({
  track,
  excludeId,
  onDone,
}: {
  track: Track;
  excludeId?: string;
  onDone: (message: string, kind?: 'info' | 'error') => void;
}) {
  const { user } = useAuth();
  const playlists = usePlaylists();
  const editable = playlists.items.filter((p) => p.id !== excludeId && canEditPlaylist(p, user?.id));

  if (playlists.loading && editable.length === 0) {
    return <div className={styles.status}>Cargando…</div>;
  }
  if (playlists.error) return <div className={styles.status}>{playlists.error}</div>;

  return (
    <>
      {editable.map((playlist) => {
        const cover = pickImage(playlist.images, 40);
        return (
          <MenuItem
            key={playlist.id}
            icon={
              cover ? (
                <img className={styles.cover} src={cover} alt="" />
              ) : (
                <span className={styles.cover}>
                  <PlaylistIcon size={14} />
                </span>
              )
            }
            onSelect={() => {
              addTracksToPlaylist(playlist.id, [track.uri])
                .then(() => onDone(`Agregada a “${playlist.name}”`))
                .catch((err) => onDone(describeError(err), 'error'));
            }}
          >
            {playlist.name}
          </MenuItem>
        );
      })}
      {playlists.hasMore && (
        <MenuItem onSelect={playlists.loadMore}>Mostrar más playlists…</MenuItem>
      )}
    </>
  );
}
