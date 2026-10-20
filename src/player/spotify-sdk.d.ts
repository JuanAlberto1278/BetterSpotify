// Tipos del Spotify Web Playback SDK (https://sdk.scdn.co/spotify-player.js).
// Escritos a mano: solo lo que usa la app.

declare namespace Spotify {
  interface Image {
    url: string;
    height?: number | null;
    width?: number | null;
  }

  interface Entity {
    name: string;
    uri: string;
  }

  interface Album extends Entity {
    images: Image[];
  }

  interface Track {
    uri: string;
    id: string | null;
    type: 'track' | 'episode' | 'ad';
    media_type: 'audio' | 'video';
    name: string;
    is_playable: boolean;
    duration_ms: number;
    album: Album;
    artists: Entity[];
  }

  interface PlaybackDisallows {
    pausing?: boolean;
    peeking_next?: boolean;
    peeking_prev?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
    toggling_repeat_context?: boolean;
    toggling_repeat_track?: boolean;
    toggling_shuffle?: boolean;
  }

  interface PlaybackState {
    context: { uri: string | null; metadata: Record<string, unknown> | null };
    disallows: PlaybackDisallows;
    paused: boolean;
    position: number;
    duration: number;
    loading?: boolean;
    timestamp: number;
    repeat_mode: 0 | 1 | 2;
    shuffle: boolean;
    track_window: {
      current_track: Track | null;
      previous_tracks: Track[];
      next_tracks: Track[];
    };
  }

  interface WebPlaybackInstance {
    device_id: string;
  }

  interface WebPlaybackError {
    message: string;
  }

  type ErrorEvent =
    | 'initialization_error'
    | 'authentication_error'
    | 'account_error'
    | 'playback_error';

  interface PlayerInit {
    name: string;
    getOAuthToken(callback: (token: string) => void): void;
    volume?: number;
    enableMediaSession?: boolean;
  }

  class Player {
    constructor(options: PlayerInit);
    connect(): Promise<boolean>;
    disconnect(): void;

    addListener(event: 'ready' | 'not_ready', cb: (instance: WebPlaybackInstance) => void): boolean;
    addListener(event: 'player_state_changed', cb: (state: PlaybackState | null) => void): boolean;
    addListener(event: ErrorEvent, cb: (error: WebPlaybackError) => void): boolean;
    addListener(event: 'autoplay_failed', cb: () => void): boolean;
    removeListener(event: string, cb?: (...args: never[]) => void): boolean;

    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    /** Debe llamarse dentro de un gesto del usuario (click) por las políticas de autoplay. */
    activateElement(): Promise<void>;
  }
}

interface Window {
  onSpotifyWebPlaybackSDKReady?: () => void;
  Spotify?: typeof Spotify;
}
