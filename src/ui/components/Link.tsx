import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '../../router/router';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

/**
 * Link interno: navega sin recargar, pero sigue siendo un <a> real
 * (Ctrl/Cmd/clic medio abren en otra pestaña).
 */
export default function Link({ to, onClick, ...props }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handleClick} {...props} />;
}
