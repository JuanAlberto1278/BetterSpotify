import { useEffect, useRef, useState } from 'react';
import { useDevices } from '../../data/usePlayback';
import { usePlayer } from '../../player/usePlayer';
import styles from './DevicePicker.module.css';

const DEVICE_ICONS: Record<string, string> = {
  computer: '💻',
  smartphone: '📱',
  tablet: '📱',
  speaker: '🔈',
  tv: '📺',
  castvideo: '📺',
  castaudio: '🔈',
  automobile: '🚗',
  gameconsole: '🎮',
};

export default function DevicePicker() {
  const [open, setOpen] = useState(false);
  const { deviceId, transferTo } = usePlayer();
  const devices = useDevices(open);
  const rootRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="Dispositivos"
        aria-expanded={open}
        title="Dispositivos"
      >
        🖥
      </button>

      {open && (
        <div className={styles.popover} role="menu">
          <div className={styles.header}>
            <span>Dispositivos</span>
            <button className={styles.refresh} onClick={devices.reload} aria-label="Actualizar">
              ↻
            </button>
          </div>

          {devices.loading && !devices.data && <p className={styles.status}>Buscando…</p>}
          {devices.error && <p className={styles.error}>{devices.error}</p>}
          {devices.data?.length === 0 && (
            <p className={styles.status}>No hay dispositivos. Abrí Spotify en otro equipo.</p>
          )}

          <ul className={styles.list}>
            {devices.data?.map((device) => (
              <li key={device.id ?? device.name}>
                <button
                  className={`${styles.device} ${device.is_active ? styles.active : ''}`}
                  disabled={!device.id || device.is_restricted || device.is_active}
                  onClick={() => {
                    if (device.id) transferTo(device.id);
                    setOpen(false);
                  }}
                  role="menuitem"
                >
                  <span className={styles.icon}>{DEVICE_ICONS[device.type.toLowerCase()] ?? '🎵'}</span>
                  <span className={styles.name}>
                    {device.name}
                    {device.id === deviceId && <small> (este navegador)</small>}
                  </span>
                  {device.is_active && <span className={styles.badge}>Activo</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
