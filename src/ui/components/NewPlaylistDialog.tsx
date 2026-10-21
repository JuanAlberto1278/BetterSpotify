import type { PlaylistDetails } from '../../api/playlists';
import { createPlaylistWith } from '../../data/playlistStore';
import { usePlayer } from '../../player/usePlayer';
import { navigate } from '../../router/router';
import { paths } from '../../router/routes';
import PlaylistDialog from './PlaylistDialog';

/** Crea una playlist vacía y navega a ella. */
export default function NewPlaylistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = usePlayer();

  const create = async (details: PlaylistDetails) => {
    const playlist = await createPlaylistWith(details);
    onClose();
    notify('info', `Playlist “${playlist.name}” creada`);
    navigate(paths.playlist(playlist.id));
  };

  return <PlaylistDialog open={open} onClose={onClose} onSubmit={create} />;
}
