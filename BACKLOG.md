# Backlog

## Pendiente

- Dejar de seguir / eliminar playlists (`DELETE /me/library` con la URI de la playlist).
- **Vista "Sonando ahora"** con portada grande.
- **Rediseño de la UI** sobre `src/ui/` (la lógica está en `auth/`, `api/`, `data/`, `player/`, `router/`).

## Hecho

- Gestionar playlists: crear, editar (nombre/descripción/pública), agregar canciones (menú ⋯), quitar canciones.
- "Escuchado recientemente" en el Inicio.
- Búsqueda completa: pestañas Todo / Canciones / Artistas / Álbumes / Playlists (`/search?q=&tab=`).
- Barra superior con menús (Biblioteca, Perfil), buscador integrado, atrás/adelante; Inicio con playlists; "Tus playlists"; Configuración (transferir al abrir).
- "Tus álbumes" (`/collection/albums`).
- ♥ Guardar / quitar en Tu biblioteca (canciones y álbumes) con `/me/library`; estado compartido en `data/libraryStore.ts`.
- Vistas de álbum (`/album/:id`) y de artista (`/artist/:id`, discografía por pestañas); links desde canciones y reproductor.
- Íconos SVG con estado (`src/ui/icons/`): aleatorio/repetir gris o acento, volumen por nivel,
  parlante tachado al silenciar.
- Cola con secciones "Agregadas por vos" / "Siguiente de: {contexto}".
  Limitación: lo agregado desde otro dispositivo no se distingue (la API no lo informa).
- Error boundary global, por vista y para la cola.
- ESLint (`npm run lint`).
