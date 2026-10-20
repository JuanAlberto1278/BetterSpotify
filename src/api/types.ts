// Tipos mínimos de la Web API: solo los campos que usa la app.

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface Paging<T> {
  items: T[];
  next: string | null;
  total: number;
  limit: number;
  offset: number;
}

/** /me en modo desarrollo: ya no incluye email, country ni product. */
export interface CurrentUser {
  id: string;
  display_name: string | null;
  images: SpotifyImage[];
  uri: string;
}

export interface SimplifiedArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SimplifiedAlbum {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
}

export interface Track {
  type: 'track';
  id: string | null;
  uri: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  is_local: boolean;
  artists: SimplifiedArtist[];
  album: SimplifiedAlbum;
}

export interface Episode {
  type: 'episode';
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
}

/** Elemento de /playlists/{id}/items. Desde 2026 el contenido viene en `item` (antes `track`). */
export interface PlaylistItem {
  added_at: string | null;
  is_local: boolean;
  item: Track | Episode | null;
}

export interface SimplifiedPlaylist {
  id: string;
  name: string;
  uri: string;
  description: string | null;
  images: SpotifyImage[] | null;
  owner: { id: string; display_name: string | null };
  collaborative: boolean;
  /** Cantidad de elementos; según la versión de la API viene en `items` o en `tracks`. */
  items?: { total: number };
  tracks?: { total: number };
}
