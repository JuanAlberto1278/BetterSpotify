export const SEARCH_TABS = ['all', 'tracks', 'artists', 'albums', 'playlists'] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];

export type Route =
  | { name: 'home' }
  | { name: 'callback' }
  | { name: 'search'; query: string; tab: SearchTab }
  | { name: 'playlist'; id: string }
  | { name: 'liked' }
  | { name: 'savedAlbums' }
  | { name: 'playlists' }
  | { name: 'settings' }
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
      return { name: 'search', query: url.searchParams.get('q') ?? '', tab: parseTab(url.searchParams.get('tab')) };
    case 'playlist':
      return parts[1] ? { name: 'playlist', id: parts[1] } : { name: 'notFound' };
    case 'collection':
      if (parts[1] === 'tracks') return { name: 'liked' };
      if (parts[1] === 'albums') return { name: 'savedAlbums' };
      if (parts[1] === 'playlists') return { name: 'playlists' };
      return { name: 'notFound' };
    case 'settings':
      return { name: 'settings' };
    case 'album':
      return parts[1] ? { name: 'album', id: parts[1] } : { name: 'notFound' };
    case 'artist':
      return parts[1] ? { name: 'artist', id: parts[1] } : { name: 'notFound' };
    default:
      return { name: 'notFound' };
  }
}

function parseTab(value: string | null): SearchTab {
  return SEARCH_TABS.includes(value as SearchTab) ? (value as SearchTab) : 'all';
}

/** Constructores de URLs: el único lugar que conoce el formato de cada ruta. */
export const paths = {
  home: () => '/',
  search: (query = '', tab: SearchTab = 'all') => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tab !== 'all') params.set('tab', tab);
    const qs = params.toString();
    return qs ? `/search?${qs}` : '/search';
  },
  playlist: (id: string) => `/playlist/${encodeURIComponent(id)}`,
  liked: () => '/collection/tracks',
  savedAlbums: () => '/collection/albums',
  playlists: () => '/collection/playlists',
  settings: () => '/settings',
  album: (id: string) => `/album/${encodeURIComponent(id)}`,
  artist: (id: string) => `/artist/${encodeURIComponent(id)}`,
};
