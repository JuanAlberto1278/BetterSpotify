// Tipos mínimos de la Web API: solo los campos que usa la app.

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

/** /me en modo desarrollo: ya no incluye email, country ni product. */
export interface CurrentUser {
  id: string;
  display_name: string | null;
  images: SpotifyImage[];
  uri: string;
}
