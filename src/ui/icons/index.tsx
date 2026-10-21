// Íconos de la app. Para cambiar el estilo visual alcanza con editar este archivo.
import { Icon, type IconProps } from './Icon';

export type { IconProps };

const FILLED = { fill: 'currentColor', stroke: 'none' } as const;

// ── Reproducción ────────────────────────────────────────────────────────────

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path {...FILLED} d="M7 4.6v14.8a1 1 0 0 0 1.53.85l11.8-7.4a1 1 0 0 0 0-1.7L8.53 3.75A1 1 0 0 0 7 4.6z" />
  </Icon>
);

export const PauseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect {...FILLED} x="6" y="4" width="4" height="16" rx="1" />
    <rect {...FILLED} x="14" y="4" width="4" height="16" rx="1" />
  </Icon>
);

export const PreviousIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect {...FILLED} x="4" y="5" width="2.5" height="14" rx="1" />
    <path {...FILLED} d="M20 5.6v12.8a1 1 0 0 1-1.56.83l-9.4-6.4a1 1 0 0 1 0-1.66l9.4-6.4A1 1 0 0 1 20 5.6z" />
  </Icon>
);

export const NextIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect {...FILLED} x="17.5" y="5" width="2.5" height="14" rx="1" />
    <path {...FILLED} d="M4 5.6v12.8a1 1 0 0 0 1.56.83l9.4-6.4a1 1 0 0 0 0-1.66l-9.4-6.4A1 1 0 0 0 4 5.6z" />
  </Icon>
);

export const ShuffleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7h3.2c1.9 0 3.1.8 4.1 2.5l3.4 5c1 1.7 2.2 2.5 4.1 2.5H21" />
    <path d="M3 17h3.2c1.4 0 2.4-.4 3.2-1.3" />
    <path d="M14.6 8.3C15.4 7.4 16.4 7 17.8 7H21" />
    <path d="M18 4l3 3-3 3" />
    <path d="M18 14l3 3-3 3" />
  </Icon>
);

export const RepeatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M4 11V9a4 4 0 0 1 4-4h12" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M20 13v2a4 4 0 0 1-4 4H4" />
  </Icon>
);

export const RepeatOneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M4 11V9a4 4 0 0 1 4-4h12" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M20 13v2a4 4 0 0 1-4 4H4" />
    <path strokeWidth={1.8} d="M11 10.5l1.5-1v5" />
  </Icon>
);

// ── Volumen ─────────────────────────────────────────────────────────────────

const Speaker = () => <path {...FILLED} d="M10 5.2 5.6 9H2.8a.8.8 0 0 0-.8.8v4.4a.8.8 0 0 0 .8.8h2.8l4.4 3.8a.6.6 0 0 0 1-.45V5.65a.6.6 0 0 0-1-.45z" />;

/** Parlante tachado. */
export const VolumeMutedIcon = (p: IconProps) => (
  <Icon {...p}>
    <Speaker />
    <path d="M15 9.5l5 5" />
    <path d="M20 9.5l-5 5" />
  </Icon>
);

/**
 * Parlante con 1, 2 o 3 ondas según el nivel (0–1). Con 0 se muestra tachado.
 */
export const VolumeIcon = ({ level, ...p }: IconProps & { level: number }) => {
  if (level <= 0) return <VolumeMutedIcon {...p} />;
  return (
    <Icon {...p}>
      <Speaker />
      <path d="M14 9.5a3.5 3.5 0 0 1 0 5" />
      {level >= 0.33 && <path d="M16.8 7.2a6.8 6.8 0 0 1 0 9.6" />}
      {level >= 0.66 && <path d="M19.6 4.6a10.5 10.5 0 0 1 0 14.8" />}
    </Icon>
  );
};

// ── Navegación y acciones ───────────────────────────────────────────────────

export const QueueIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h14" />
    <path d="M3 12h14" />
    <path d="M3 18h9" />
    <path {...FILLED} d="M16 15.2v5.6a.6.6 0 0 0 .92.5l4.2-2.8a.6.6 0 0 0 0-1l-4.2-2.8a.6.6 0 0 0-.92.5z" />
  </Icon>
);

export const DevicesIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="4" width="13" height="10" rx="1.5" />
    <path d="M5.5 18h6" />
    <path d="M8.5 14v4" />
    <rect x="17" y="8" width="5" height="12" rx="1" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      {...FILLED}
      d="M12 20.6s-7.6-4.6-9.4-9.3C1.3 8 3.5 4.4 7 4.4c2.1 0 3.6 1.1 5 2.9 1.4-1.8 2.9-2.9 5-2.9 3.5 0 5.7 3.6 4.4 6.9-1.8 4.7-9.4 9.3-9.4 9.3z"
    />
  </Icon>
);

/** Corazón vacío: "no está en Tus me gusta". */
export const HeartOutlineIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20.6s-7.6-4.6-9.4-9.3C1.3 8 3.5 4.4 7 4.4c2.1 0 3.6 1.1 5 2.9 1.4-1.8 2.9-2.9 5-2.9 3.5 0 5.7 3.6 4.4 6.9-1.8 4.7-9.4 9.3-9.4 9.3z" />
  </Icon>
);

/** Disco: placeholder para portadas de álbum. */
export const DiscIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
  </Icon>
);

/** Persona: placeholder para fotos de artista. */
export const ArtistIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Icon>
);

// ── Barra superior ──────────────────────────────────────────────────────────

/** Logo de la app (mismo dibujo que el favicon). Usa colores propios. */
export const LogoIcon = ({ size = 28, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...p}>
    <rect width="32" height="32" rx="8" fill="var(--accent)" />
    <path fill="#fff" d="M12 9.2v13.6a.9.9 0 0 0 1.38.77l10.8-6.8a.9.9 0 0 0 0-1.54l-10.8-6.8A.9.9 0 0 0 12 9.2z" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

/** Libros en un estante: "Biblioteca". */
export const LibraryIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4v16" />
    <path d="M10 4v16" />
    <path d="M14.5 4.6l4.8 14.8" />
  </Icon>
);

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
  </Icon>
);

export const KeyboardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
  </Icon>
);

export const LogoutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);

/** Ícono genérico de playlist (placeholder sin portada). */
export const PlaylistIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h12" />
    <path d="M3 12h12" />
    <path d="M3 18h7" />
    <path d="M17 18V8l4-1" />
    <circle cx="15" cy="18" r="2" />
  </Icon>
);

/** Tres puntos: "más opciones". */
export const MoreIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle {...FILLED} cx="5" cy="12" r="1.8" />
    <circle {...FILLED} cx="12" cy="12" r="1.8" />
    <circle {...FILLED} cx="19" cy="12" r="1.8" />
  </Icon>
);

export const EditIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Icon>
);

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
);

export const RefreshIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v5h-5" />
  </Icon>
);

/** Barras de ecualizador: indica la canción que está sonando. */
export const EqualizerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect {...FILLED} x="4" y="10" width="3" height="10" rx="1" />
    <rect {...FILLED} x="10.5" y="4" width="3" height="16" rx="1" />
    <rect {...FILLED} x="17" y="13" width="3" height="7" rx="1" />
  </Icon>
);

// ── Tipos de dispositivo ────────────────────────────────────────────────────

export const ComputerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </Icon>
);

export const SmartphoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </Icon>
);

export const SpeakerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="14" r="3.5" />
    <circle cx="12" cy="6.5" r="1" />
  </Icon>
);

export const TvIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="13" rx="1.5" />
    <path d="M8 21h8" />
  </Icon>
);

export const MusicIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </Icon>
);

/** Ícono según el `type` de dispositivo que devuelve /me/player/devices. */
export function DeviceTypeIcon({ type, ...p }: IconProps & { type: string }) {
  switch (type.toLowerCase()) {
    case 'computer':
      return <ComputerIcon {...p} />;
    case 'smartphone':
    case 'tablet':
      return <SmartphoneIcon {...p} />;
    case 'speaker':
    case 'castaudio':
    case 'avr':
    case 'stb':
      return <SpeakerIcon {...p} />;
    case 'tv':
    case 'castvideo':
      return <TvIcon {...p} />;
    default:
      return <MusicIcon {...p} />;
  }
}
