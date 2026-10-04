# Sonora

Reproductor de música de escritorio para Windows. Importa tus mp3/flac/wav, organízalos en playlists con nombre y portada propios, y escúchalos desde una biblioteca local — sin cuentas ni streaming.

## Cómo usar Sonora

1. **Instala la app** con el `.exe` o el `.msi` de [`releases/`](./releases) y ábrela.
2. **Añade canciones**: botón "Añadir canciones" en Biblioteca → elige tus mp3/flac/wav. Sonora lee el título, artista y álbum del propio archivo automáticamente.
3. **Reproduce**: haz clic en cualquier canción de la lista. Los controles (play/pausa, anterior/siguiente, volumen) están en la barra inferior, siempre visible.
4. **Crea playlists**: en Playlists → "Nueva playlist" → ponle nombre y foto, y marca las canciones que quieras incluir (o "Seleccionar todas").
5. **Edita una canción**: pasa el ratón por una fila y pulsa el lápiz para cambiar su título, artista, álbum o carátula.
6. **Rellena las carátulas que falten**: en Biblioteca → "Buscar carátulas", elige qué canciones sin carátula quieres procesar y Sonora las busca por internet. Avisa de que no siempre acierta — revísalas luego si hace falta.
7. **Ajustes**: tema (claro/oscuro/automático), idioma y densidad de la lista. Los cambios se aplican al pulsar "Guardar cambios".

## Funciones

- Biblioteca local con metadatos (título, artista, álbum, carátula) leídos automáticamente del archivo al importarlo.
- Playlists con nombre y foto de portada, con selector de canciones (manual o "seleccionar todas").
- Edición de canciones (título, artista, álbum, carátula) desde la propia app.
- Búsqueda automática de carátulas por internet (iTunes y, si no encuentra nada, MusicBrainz + Cover Art Archive como alternativa).
- Ajustes: tema claro/oscuro/automático, idioma (ES, CA, EN, FR, DE, IT) y densidad de la lista.

## Stack

Tauri 2 (Rust) + React + TypeScript + SQLite (`rusqlite`).

## Desarrollo

```sh
npm install
npm run tauri dev
```

## Generar el instalador

```sh
npm run tauri build
```

Esto compila la app en modo release y genera el `.exe` (NSIS) y el `.msi` directamente en:

```
src-tauri/target/release/bundle/
```

### 👉 Instalador listo para usar

Tras cada build, copiamos el `.exe` y el `.msi` de la última versión a **[`releases/`](./releases)** — ahí siempre están los dos instaladores de la versión más reciente, sin versiones antiguas acumuladas.
