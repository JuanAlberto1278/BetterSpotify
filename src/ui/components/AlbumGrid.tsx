import type { AlbumSummary } from '../../api/types';
import type { PagedList } from '../../data/usePagedList';
import { paths } from '../../router/routes';
import { ALBUM_TYPE_LABEL } from '../format';
import { DiscIcon } from '../icons';
import { pickImage } from '../images';
import CardGrid from './CardGrid';

interface Props {
  list: PagedList<AlbumSummary>;
  emptyText?: string;
  /** Qué mostrar debajo del nombre: "año · tipo" (discografía) o los artistas (biblioteca). */
  subtitle?: 'release' | 'artists';
}

export default function AlbumGrid({ list, emptyText, subtitle = 'release' }: Props) {
  return (
    <CardGrid
      list={list}
      emptyText={emptyText}
      toCard={(album) => ({
        key: album.id,
        to: paths.album(album.id),
        title: album.name,
        subtitle:
          subtitle === 'artists'
            ? album.artists.map((a) => a.name).join(', ')
            : `${album.release_date.slice(0, 4)} · ${ALBUM_TYPE_LABEL[album.album_type] ?? 'Álbum'}`,
        imageUrl: pickImage(album.images, 200),
        placeholder: <DiscIcon size={48} />,
      })}
    />
  );
}
