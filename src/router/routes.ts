export type Route =
  | { name: 'home' }
  | { name: 'callback' }
  | { name: 'search'; query: string }
  | { name: 'playlist'; id: string }
  | { name: 'liked' }
  | { name: 'album'; id: string }
  | { name: 'artist'; id: string }
  | { name: 'notFound' };

/** Convierte "pathname?search" en una ruta. */
export function parseRoute(location: string): Route {
  const url = new URL(location, window.location.origin);
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);

  switch (parts[0]) {
    case undefined:
      return { name: 'home' };
    case 'callback':
      return { name: 'callback' };
    case 'search':
      return { name: 'search', query: url.searchParams.get('q') ?? '' };
    case 'playlist':
      return parts[1] ? { name: 'playlist', id: parts[1] } : { name: 'notFound' };
    case 'collection':
      return parts[1] === 'tracks' ? { name: 'liked' } : { name: 'notFound' };
    case 'album':
      return parts[1] ? { name: 'album', id: parts[1] } : { name: 'notFound' };
    case 'artist':
      return parts[1] ? { name: 'artist', id: parts[1] } : { name: 'notFound' };
    default:
      return { name: 'notFound' };
  }
}

/** Constructores de URLs: el único lugar que conoce el formato de cada ruta. */
export const paths = {
  home: () => '/',
  search: (query = '') => (query ? `/search?q=${encodeURIComponent(query)}` : '/search'),
  playlist: (id: string) => `/playlist/${encodeURIComponent(id)}`,
  liked: () => '/collection/tracks',
  album: (id: string) => `/album/${encodeURIComponent(id)}`,
  artist: (id: string) => `/artist/${encodeURIComponent(id)}`,
};
