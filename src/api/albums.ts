import { spotifyFetch } from './client';
import type { Album, Paging, SimplifiedAlbum, SimplifiedTrack, Track } from './types';

export function getAlbum(albumId: string, signal?: AbortSignal): Promise<Album> {
  return spotifyFetch(`/albums/${encodeURIComponent(albumId)}`, { signal });
}

/**
 * Canciones de un álbum como `Track` completos. La API las devuelve sin el
 * objeto `album`; se completa con el del álbum para poder reusar TrackList.
 */
export function albumTracksAsTracks(album: SimplifiedAlbum, page: Paging<SimplifiedTrack>): Paging<Track> {
  const albumRef: SimplifiedAlbum = { id: album.id, name: album.name, uri: album.uri, images: album.images };
  return {
    ...page,
    items: page.items
      .filter((t) => !t.is_local)
      .map((t) => ({ ...t, type: 'track', is_local: false, album: albumRef })),
  };
}

/** Siguiente página de canciones de un álbum (`url` = el `next` de la anterior). */
export async function getAlbumTracksPage(
  album: SimplifiedAlbum,
  url: string,
  signal?: AbortSignal,
): Promise<Paging<Track>> {
  const page = await spotifyFetch<Paging<SimplifiedTrack>>(url, { signal });
  return albumTracksAsTracks(album, page);
}
