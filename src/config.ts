export const CLIENT_ID = (import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? '').trim();

// Debe coincidir exactamente con la Redirect URI registrada en el Dashboard.
export const REDIRECT_URI = 'http://127.0.0.1:5173/callback';

export const SCOPES = [
  'streaming',
  // El Web Playback SDK exige user-read-email (aunque /me ya no devuelva el email).
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
];

export const ACCOUNTS_URL = 'https://accounts.spotify.com';
export const API_BASE_URL = 'https://api.spotify.com/v1';
