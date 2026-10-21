import type { SimplifiedPlaylist } from '../../api/types';
import type { PagedList } from '../../data/usePagedList';
import { paths } from '../../router/routes';
import { PlaylistIcon } from '../icons';
import { pickImage } from '../images';
import CardGrid from './CardGrid';

export default function PlaylistGrid({ list }: { list: PagedList<SimplifiedPlaylist> }) {
  return (
    <CardGrid
      list={list}
      emptyText="Todavía no tenés playlists."
      toCard={(playlist) => ({
        key: playlist.id,
        to: paths.playlist(playlist.id),
        title: playlist.name,
        subtitle: `De ${playlist.owner.display_name ?? playlist.owner.id}`,
        imageUrl: pickImage(playlist.images, 200),
        placeholder: <PlaylistIcon size={48} />,
      })}
    />
  );
}
