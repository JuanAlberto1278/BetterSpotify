# Backlog

## Pendiente

- **Vista "Sonando ahora"** con portada grande.
- **Gestionar playlists** (crear, agregar canciones). Requiere scopes de modificación → re-login.
- **Rediseño de la UI** sobre `src/ui/` (la lógica está en `auth/`, `api/`, `data/`, `player/`, `router/`).

## Hecho

- ♥ Guardar / quitar en Tu biblioteca (canciones y álbumes) con `/me/library`; estado compartido en `data/libraryStore.ts`.
- Vistas de álbum (`/album/:id`) y de artista (`/artist/:id`, discografía por pestañas); links desde canciones y reproductor.

- Íconos SVG con estado (`src/ui/icons/`): aleatorio/repetir gris o acento, volumen por nivel,
  parlante tachado al silenciar.
- Cola con secciones "Agregadas por vos" / "Siguiente de: {contexto}".
  Limitación: lo agregado desde otro dispositivo no se distingue (la API no lo informa).
- Error boundary global, por vista y para la cola.
- ESLint (`npm run lint`).
