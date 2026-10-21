import { spotifyFetch } from './client';
import type { AlbumSummary, Artist, Paging } from './types';

/** En modo desarrollo /artists/{id}/albums admite como máximo 10 por página. */
const ALBUMS_PAGE_SIZE = 10;

export type DiscographyGroup = 'album' | 'single' | 'appears_on' | 'compilation';

export function getArtist(artistId: string, signal?: AbortSignal): Promise<Artist> {
  return spotifyFetch(`/artists/${encodeURIComponent(artistId)}`, { signal });
}

/** Una página de la discografía. `url` = el `next` de la página anterior. */
export function getArtistAlbumsPage(
  artistId: string,
  groups: DiscographyGroup[],
  url: string | null,
  signal?: AbortSignal,
): Promise<Paging<AlbumSummary>> {
  return spotifyFetch(url ?? `/artists/${encodeURIComponent(artistId)}/albums`, {
    query: url ? undefined : { include_groups: groups.join(','), limit: ALBUMS_PAGE_SIZE },
    signal,
  });
}
