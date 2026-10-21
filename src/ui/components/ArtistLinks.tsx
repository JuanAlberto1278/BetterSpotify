import { Fragment } from 'react';
import { idFromUri } from '../../api/uri';
import { paths } from '../../router/routes';
import Link from './Link';

interface Props {
  artists: { name: string; uri: string }[];
  className?: string;
}

/** "Artista 1, Artista 2" con cada nombre enlazado a su página. */
export default function ArtistLinks({ artists, className }: Props) {
  return (
    <>
      {artists.map((artist, index) => {
        const id = idFromUri(artist.uri);
        return (
          <Fragment key={artist.uri || artist.name}>
            {index > 0 && ', '}
            {id ? (
              <Link to={paths.artist(id)} className={className} onDoubleClick={(e) => e.stopPropagation()}>
                {artist.name}
              </Link>
            ) : (
              artist.name
            )}
          </Fragment>
        );
      })}
    </>
  );
}
