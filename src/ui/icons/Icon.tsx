import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Tamaño en px (ancho = alto). Por defecto 20. */
  size?: number;
}

/**
 * Base de todos los íconos: grilla de 24×24, trazo con `currentColor`, así el
 * ícono toma el color del texto del botón (gris, blanco, acento...).
 * Las formas rellenas usan fill="currentColor" stroke="none".
 */
export function Icon({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
