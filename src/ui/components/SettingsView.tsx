import { updateSettings, useSettings } from '../../settings/settings';
import styles from './View.module.css';

export default function SettingsView() {
  const settings = useSettings();

  return (
    <section className={styles.narrow}>
      <h1 className={styles.pageTitle}>Configuración</h1>

      <h2 className={styles.sectionTitle}>Reproducción</h2>
      <label className={styles.setting}>
        <span>
          <span className={styles.settingTitle}>Pasar la reproducción a este navegador al abrir la app</span>
          <span className={styles.settingHelp}>
            Si está desactivado, lo que suene en otro dispositivo sigue ahí hasta que toques play o elijas
            este navegador en Dispositivos.
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          className={styles.switch}
          checked={settings.autoTransferOnStart}
          onChange={(e) => updateSettings({ autoTransferOnStart: e.target.checked })}
        />
      </label>

      <p className={styles.settingNote}>
        Las preferencias se guardan en este navegador. Los cambios se aplican la próxima vez que abras la app.
      </p>
    </section>
  );
}
