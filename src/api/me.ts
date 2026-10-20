import { spotifyFetch } from './client';
import type { CurrentUser } from './types';

export function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  return spotifyFetch<CurrentUser>('/me', { signal });
}
