const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

let sdkPromise: Promise<typeof Spotify> | null = null;

/** Inyecta el script del SDK una sola vez y resuelve cuando está listo. */
export function loadSpotifySdk(): Promise<typeof Spotify> {
  sdkPromise ??= new Promise((resolve, reject) => {
    if (window.Spotify) return resolve(window.Spotify);

    // El SDK llama a esta función global al terminar de cargar.
    window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify!);

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error('No se pudo cargar el Web Playback SDK.'));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}
