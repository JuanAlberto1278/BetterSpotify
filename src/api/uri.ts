/** "spotify:artist:123" → "123" (null si no es una URI de Spotify). */
export function idFromUri(uri: string): string | null {
  const parts = uri.split(':');
  return parts.length === 3 && parts[0] === 'spotify' ? parts[2] : null;
}
