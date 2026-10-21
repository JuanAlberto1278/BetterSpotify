import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Link from './Link';
import styles from './Menu.module.css';

interface MenuProps {
  /** Contenido del botón que abre el menú. */
  trigger: ReactNode;
  /** Etiqueta accesible del botón. */
  label: string;
  /** Hacia qué lado se alinea el desplegable respecto del botón. */
  align?: 'left' | 'right';
  triggerClassName?: string;
  /** Recibe `close` para cerrar el menú al elegir algo. */
  children: (close: () => void) => ReactNode;
}

/**
 * Menú desplegable accesible: se cierra con clic afuera, Escape o Tab;
 * ↑/↓ recorren los ítems.
 */
export default function Menu({ trigger, label, align = 'left', triggerClassName = '', children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    // Al abrir, el foco va al primer ítem (navegación por teclado).
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    }
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        className={`${styles.trigger} ${open ? styles.open : ''} ${triggerClassName}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {trigger}
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          className={`${styles.menu} ${align === 'right' ? styles.right : ''}`}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

interface ItemProps {
  icon?: ReactNode;
  children: ReactNode;
  /** Ruta interna (usa el router) */
  to?: string;
  /** URL externa (se abre en otra pestaña) */
  href?: string;
  onSelect?: () => void;
  active?: boolean;
}

export function MenuItem({ icon, children, to, href, onSelect, active = false }: ItemProps) {
  const className = `${styles.item} ${active ? styles.active : ''}`;
  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} role="menuitem" className={className} onClick={onSelect} tabIndex={-1}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" role="menuitem" className={className} onClick={onSelect} tabIndex={-1}>
        {content}
      </a>
    );
  }
  return (
    <button role="menuitem" className={className} onClick={onSelect} tabIndex={-1}>
      {content}
    </button>
  );
}

export function MenuSeparator() {
  return <div className={styles.separator} role="separator" />;
}

export function MenuHeading({ children }: { children: ReactNode }) {
  return <div className={styles.heading}>{children}</div>;
}
