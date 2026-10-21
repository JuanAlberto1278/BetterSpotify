# Backlog

## UI

### Íconos SVG en lugar de emojis
Los emojis ignoran `color` de CSS, así que hoy los estados "activo" no se ven.

- Reemplazar todos los emojis de controles por íconos SVG inline con `fill="currentColor"`,
  para que tomen el color del botón (verde = activo, gris = inactivo, blanco en hover).
- Centralizarlos en un solo módulo (`src/ui/icons/`) para poder cambiarlos en el rediseño.
- **Aleatorio / repetir:** gris cuando está apagado, color de acento cuando está activo.
  Repetir canción con su ícono propio (el "1").
- **Volumen:** el ícono depende del nivel:
  - 0 / silenciado → parlante tachado
  - bajo (< 33 %) → parlante con una onda
  - medio (< 66 %) → dos ondas
  - alto → tres ondas
- Resto de botones: play/pausa, anterior/siguiente, cola, dispositivos (y el ícono según el
  tipo de dispositivo), agregar a la cola, buscar, me gusta.

### Cola: distinguir lo agregado manualmente
Hoy "A continuación" mezcla lo que agregaste con ＋ y lo que sigue de la playlist/álbum.

- Separar en dos secciones, como Spotify: **"Agregadas por vos"** y **"Siguiente de: {contexto}"**.
- Limitación de la API: `GET /me/player/queue` no indica qué elementos agregó el usuario.
  Opción: recordar en el `PlayerProvider` las URIs agregadas con `addToQueue` y marcarlas
  (ir sacándolas a medida que suenan). Lo agregado desde otro dispositivo no se podría
  distinguir.
