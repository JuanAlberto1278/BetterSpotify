import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  /** Si cambia (p. ej. la ruta), el error se descarta y se vuelve a intentar renderizar. */
  resetKey?: unknown;
  /** Texto del título del mensaje. */
  title?: string;
}

interface State {
  error: Error | null;
}

/**
 * Atrapa errores de render de sus hijos y muestra un mensaje con "Reintentar"
 * en lugar de dejar la pantalla en negro.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ui] Error de render atrapado por ErrorBoundary', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private retry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className={styles.box} role="alert">
        <h2 className={styles.title}>{this.props.title ?? 'Algo salió mal'}</h2>
        <p className={styles.message}>{error.message}</p>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={this.retry}>
            Reintentar
          </button>
          <button className={styles.secondary} onClick={() => window.location.reload()}>
            Recargar la página
          </button>
        </div>
      </div>
    );
  }
}
