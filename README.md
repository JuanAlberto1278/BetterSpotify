# BetterSpotify

Cliente web personal de Spotify: React + TypeScript + Vite, sin backend (Authorization Code + PKCE), reproducción con el Web Playback SDK.

## Setup

1. En el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), agregá la Redirect URI `http://127.0.0.1:5173/callback`.
2. Copiá `.env.example` a `.env` y completá `VITE_SPOTIFY_CLIENT_ID`.
3. `npm install` y `npm run dev`.
4. Abrí **http://127.0.0.1:5173** (no `localhost`: el redirect tiene que coincidir exactamente).

## Estructura

- `src/auth/` – PKCE, tokens, refresh automático
- `src/api/` – cliente de la Web API (`spotifyFetch`) con manejo de 401/403/429
- `src/data/` – hooks de datos (playlists, canciones, búsqueda) con paginación
- `src/player/` – Web Playback SDK, hook del player y atajos de teclado
- `src/router/` – rutas (`/search?q=`, `/playlist/:id`, `/collection/tracks`) sin dependencias
- `src/ui/` – componentes y estilos (solo presentación)
