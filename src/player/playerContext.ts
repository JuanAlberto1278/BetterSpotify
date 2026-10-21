import { createContext } from 'react';
import type { RepeatMode } from '../api/player';

// Tipos públicos del player (lo que consume la UI) y su contexto de React.

export type { RepeatMode };
export type PlayerStatus = 'connecting' | 'ready' | 'error';

export interface PlayerTrack {
  uri: string;
  name: string;
  artists: { name: string; uri: string }[];
  album: { name: string; uri: string; imageUrl: string | null };
  durationMs: number;
}

/** Foto de la posición en un instante; usePlaybackPosition() la interpola. */
export interface PositionSnapshot {
  positionMs: number;
  durationMs: number;
  paused: boolean;
  /** Date.now() del momento en que se tomó la foto. */
  takenAt: number;
}

export interface Toast {
  id: number;
  kind: 'error' | 'info';
  text: string;
}

export interface PlayContextOptions {
  /** Canción por la que empezar. */
  trackUri?: string;
  /**
   * Si Spotify rechaza el contexto, se reproducen estas URIs como lista suelta
   * (útil para "Tus me gusta").
   */
  fallbackUris?: string[];
}

export interface PlayerContextValue {
  status: PlayerStatus;
  deviceId: string | null;
  /** true si este navegador es el dispositivo activo de Spotify. */
  isActive: boolean;
  paused: boolean;
  track: PlayerTrack | null;
  contextUri: string | null;
  /** Nombre de la playlist/álbum que suena, si el SDK lo informa. */
  contextName: string | null;
  snapshot: PositionSnapshot;
  volume: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  canSkipPrev: boolean;
  canSkipNext: boolean;
  canSeek: boolean;
  canShuffle: boolean;
  canRepeat: boolean;
  /** Aumenta cada vez que se agrega algo a la cola (para refrescar la vista de cola). */
  queueVersion: number;
  /**
   * URIs agregadas a la cola desde esta app y que todavía no sonaron. La API no
   * distingue lo agregado por el usuario, así que se lleva la cuenta acá.
   */
  queuedByUser: string[];
  toast: Toast | null;

  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (positionMs: number) => void;
  /** Posición actual interpolada, sin provocar renders (para atajos de teclado). */
  getPositionMs: () => number;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  /** off → context → track → off */
  cycleRepeat: () => void;
  /** Trae la reproducción a este navegador y la reanuda. */
  transferHere: () => void;
  /** Pasa la reproducción a otro dispositivo de Spotify Connect. */
  transferTo: (deviceId: string) => void;
  playContext: (contextUri: string, options?: PlayContextOptions) => void;
  /** Reproduce una lista suelta de canciones empezando por `startIndex`. */
  playTracks: (uris: string[], startIndex?: number) => void;
  addToQueue: (uri: string) => void;
  /** Muestra un aviso en la barra del reproductor. */
  notify: (kind: Toast['kind'], text: string) => void;
  dismissToast: () => void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);
