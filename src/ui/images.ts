import type { SpotifyImage } from '../api/types';

/** La imagen más chica que mida al menos `minSize` px (o la más grande disponible). */
export function pickImage(images: SpotifyImage[] | null | undefined, minSize: number): string | null {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((img) => (img.width ?? Infinity) >= minSize) ?? sorted[sorted.length - 1]).url;
}
