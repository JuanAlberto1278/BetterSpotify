import type { Artist } from '../../api/types';
import type { PagedList } from '../../data/usePagedList';
import { paths } from '../../router/routes';
import { ArtistIcon } from '../icons';
import { pickImage } from '../images';
import CardGrid from './CardGrid';

export default function ArtistGrid({ list, emptyText }: { list: PagedList<Artist>; emptyText?: string }) {
  return (
    <CardGrid
      list={list}
      emptyText={emptyText}
      toCard={(artist) => ({
        key: artist.id,
        to: paths.artist(artist.id),
        title: artist.name,
        subtitle: 'Artista',
        imageUrl: pickImage(artist.images, 200),
        placeholder: <ArtistIcon size={48} />,
        round: true,
      })}
    />
  );
}
