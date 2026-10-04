use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use lofty::file::{AudioFile, TaggedFileExt};
use lofty::tag::Accessor;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

use crate::db::Db;
use crate::models::{Playlist, Settings, Song};

pub struct AppPaths {
    pub music_dir: PathBuf,
    pub covers_dir: PathBuf,
}

fn now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

fn row_to_song(row: &rusqlite::Row) -> rusqlite::Result<Song> {
    Ok(Song {
        id: row.get("id")?,
        title: row.get("title")?,
        artist: row.get("artist")?,
        album: row.get("album")?,
        duration_secs: row.get("duration_secs")?,
        file_path: row.get("file_path")?,
        cover_path: row.get("cover_path")?,
    })
}

/// Copies an image file into the covers directory and returns its new absolute path.
fn copy_cover_image(covers_dir: &PathBuf, source: &str, basename: &str) -> Result<String, String> {
    let source_path = PathBuf::from(source);
    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");
    let dest = covers_dir.join(format!("{basename}.{ext}"));
    fs::copy(&source_path, &dest).map_err(|e| e.to_string())?;
    Ok(dest.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn list_songs(db: State<Db>) -> Result<Vec<Song>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM songs ORDER BY artist COLLATE NOCASE, album COLLATE NOCASE, title COLLATE NOCASE")
        .map_err(|e| e.to_string())?;
    let songs = stmt
        .query_map([], row_to_song)
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(songs)
}

#[tauri::command]
pub fn import_songs(
    app: AppHandle,
    db: State<Db>,
    paths: State<AppPaths>,
) -> Result<Vec<Song>, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("Audio", &["mp3", "flac", "wav", "m4a", "ogg", "aac"])
        .blocking_pick_files();

    let Some(files) = picked else {
        return list_songs(db);
    };

    let conn = db.0.lock().map_err(|e| e.to_string())?;

    for file in files {
        let src_path = match file.into_path() {
            Ok(p) => p,
            Err(_) => continue,
        };

        let tagged_file = match lofty::read_from_path(&src_path) {
            Ok(t) => Some(t),
            Err(_) => None,
        };

        let fallback_title = src_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Pista desconocida")
            .to_string();

        let tag = tagged_file
            .as_ref()
            .and_then(|t| t.primary_tag().or_else(|| t.first_tag()));

        let title = tag
            .and_then(|t| t.title())
            .map(|c| c.into_owned())
            .unwrap_or(fallback_title);
        let artist = tag
            .and_then(|t| t.artist())
            .map(|c| c.into_owned())
            .unwrap_or_else(|| "Artista desconocido".to_string());
        let album = tag
            .and_then(|t| t.album())
            .map(|c| c.into_owned())
            .unwrap_or_else(|| "Álbum desconocido".to_string());
        let duration_secs = tagged_file
            .as_ref()
            .map(|t| t.properties().duration().as_secs() as i64)
            .unwrap_or(0);

        let id = Uuid::new_v4().to_string();
        let ext = src_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("mp3");
        let dest_path = paths.music_dir.join(format!("{id}.{ext}"));
        if fs::copy(&src_path, &dest_path).is_err() {
            continue;
        }

        let cover_path = tag.and_then(|t| t.pictures().first()).and_then(|pic| {
            let mime_ext = match pic.mime_type() {
                Some(m) => format!("{m:?}").to_lowercase(),
                None => "jpg".to_string(),
            };
            let ext = if mime_ext.contains("png") { "png" } else { "jpg" };
            let dest = paths.covers_dir.join(format!("{id}.{ext}"));
            fs::write(&dest, pic.data()).ok()?;
            Some(dest.to_string_lossy().into_owned())
        });

        conn.execute(
            "INSERT INTO songs (id, title, artist, album, duration_secs, file_path, cover_path, added_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                id,
                title,
                artist,
                album,
                duration_secs,
                dest_path.to_string_lossy().into_owned(),
                cover_path,
                now()
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    drop(conn);
    list_songs(db)
}

#[tauri::command]
pub fn update_song(
    db: State<Db>,
    paths: State<AppPaths>,
    id: String,
    title: String,
    artist: String,
    album: String,
    cover_source_path: Option<String>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    if let Some(src) = cover_source_path {
        let cover_path = copy_cover_image(&paths.covers_dir, &src, &id)?;
        conn.execute(
            "UPDATE songs SET title = ?1, artist = ?2, album = ?3, cover_path = ?4 WHERE id = ?5",
            params![title, artist, album, cover_path, id],
        )
        .map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "UPDATE songs SET title = ?1, artist = ?2, album = ?3 WHERE id = ?4",
            params![title, artist, album, id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn pick_cover_image(app: AppHandle) -> Result<Option<String>, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("Imágenes", &["png", "jpg", "jpeg", "webp"])
        .blocking_pick_file();

    match picked {
        Some(fp) => match fp.into_path() {
            Ok(p) => Ok(Some(p.to_string_lossy().into_owned())),
            Err(e) => Err(e.to_string()),
        },
        None => Ok(None),
    }
}

fn playlist_row_to_playlist(row: &rusqlite::Row) -> rusqlite::Result<Playlist> {
    Ok(Playlist {
        id: row.get("id")?,
        name: row.get("name")?,
        cover_path: row.get("cover_path")?,
        song_count: row.get("song_count")?,
        total_duration_secs: row.get("total_duration_secs")?,
    })
}

#[tauri::command]
pub fn list_playlists(db: State<Db>) -> Result<Vec<Playlist>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.name, p.cover_path,
                    COUNT(ps.song_id) AS song_count,
                    COALESCE(SUM(s.duration_secs), 0) AS total_duration_secs
             FROM playlists p
             LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
             LEFT JOIN songs s ON s.id = ps.song_id
             GROUP BY p.id
             ORDER BY p.created_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let playlists = stmt
        .query_map([], playlist_row_to_playlist)
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(playlists)
}

#[tauri::command]
pub fn create_playlist(
    db: State<Db>,
    paths: State<AppPaths>,
    name: String,
    cover_source_path: Option<String>,
) -> Result<Playlist, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();

    let cover_path = match cover_source_path {
        Some(src) => Some(copy_cover_image(
            &paths.covers_dir,
            &src,
            &format!("playlist-{id}"),
        )?),
        None => None,
    };

    conn.execute(
        "INSERT INTO playlists (id, name, cover_path, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, name, cover_path, now()],
    )
    .map_err(|e| e.to_string())?;

    Ok(Playlist {
        id,
        name,
        cover_path,
        song_count: 0,
        total_duration_secs: 0,
    })
}

#[tauri::command]
pub fn update_playlist(
    db: State<Db>,
    paths: State<AppPaths>,
    id: String,
    name: String,
    cover_source_path: Option<String>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    if let Some(src) = cover_source_path {
        let cover_path = copy_cover_image(&paths.covers_dir, &src, &format!("playlist-{id}"))?;
        conn.execute(
            "UPDATE playlists SET name = ?1, cover_path = ?2 WHERE id = ?3",
            params![name, cover_path, id],
        )
        .map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "UPDATE playlists SET name = ?1 WHERE id = ?2",
            params![name, id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_playlist(db: State<Db>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM playlists WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_playlist_songs(db: State<Db>, playlist_id: String) -> Result<Vec<Song>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT s.* FROM songs s
             JOIN playlist_songs ps ON ps.song_id = s.id
             WHERE ps.playlist_id = ?1
             ORDER BY ps.position ASC",
        )
        .map_err(|e| e.to_string())?;
    let songs = stmt
        .query_map(params![playlist_id], row_to_song)
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(songs)
}

#[tauri::command]
pub fn add_songs_to_playlist(
    db: State<Db>,
    playlist_id: String,
    song_ids: Vec<String>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut next_pos: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM playlist_songs WHERE playlist_id = ?1",
            params![playlist_id],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    for song_id in song_ids {
        conn.execute(
            "INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES (?1, ?2, ?3)",
            params![playlist_id, song_id, next_pos],
        )
        .map_err(|e| e.to_string())?;
        next_pos += 1;
    }

    Ok(())
}

#[tauri::command]
pub fn remove_song_from_playlist(
    db: State<Db>,
    playlist_id: String,
    song_id: String,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = ?1 AND song_id = ?2",
        params![playlist_id, song_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_settings(db: State<Db>) -> Result<Settings, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut settings = Settings::default();
    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    for row in rows.filter_map(|r| r.ok()) {
        match row.0.as_str() {
            "theme" => settings.theme = row.1,
            "language" => settings.language = row.1,
            "density" => settings.density = row.1,
            _ => {}
        }
    }
    Ok(settings)
}

#[tauri::command]
pub fn set_settings(db: State<Db>, settings: Settings) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    for (key, value) in [
        ("theme", &settings.theme),
        ("language", &settings.language),
        ("density", &settings.density),
    ] {
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Debug, Serialize, Clone)]
pub struct CoverFetchSummary {
    pub found: i64,
    pub not_found: i64,
}

#[derive(Debug, Serialize, Clone)]
struct CoverFetchProgress {
    current: usize,
    total: usize,
    title: String,
}

const UNKNOWN_ARTIST: &str = "Artista desconocido";

#[derive(Debug, Deserialize)]
struct ItunesSearchResponse {
    results: Vec<ItunesSearchResult>,
}

#[derive(Debug, Deserialize)]
struct ItunesSearchResult {
    #[serde(rename = "artworkUrl100")]
    artwork_url_100: Option<String>,
}

#[derive(Debug, Deserialize)]
struct MusicBrainzSearchResponse {
    recordings: Vec<MusicBrainzRecording>,
}

#[derive(Debug, Deserialize)]
struct MusicBrainzRecording {
    releases: Option<Vec<MusicBrainzRelease>>,
}

#[derive(Debug, Deserialize)]
struct MusicBrainzRelease {
    id: String,
}

/// When the file had no real tag, `artist` falls back to [`UNKNOWN_ARTIST`] — including it
/// in the search only hurts matching, so in that case we search by title alone.
fn search_term(artist: &str, title: &str) -> String {
    if artist.trim().is_empty() || artist == UNKNOWN_ARTIST {
        title.to_string()
    } else {
        format!("{artist} {title}")
    }
}

async fn find_itunes_artwork_url(client: &reqwest::Client, artist: &str, title: &str) -> Option<String> {
    let term = search_term(artist, title);
    let resp = client
        .get("https://itunes.apple.com/search")
        .query(&[("term", term.as_str()), ("entity", "song"), ("limit", "1")])
        .send()
        .await
        .ok()?;
    let parsed = resp.json::<ItunesSearchResponse>().await.ok()?;
    let url = parsed.results.into_iter().next()?.artwork_url_100?;
    // The default thumbnail is tiny; iTunes serves larger artwork at the same
    // path with the resolution token swapped out.
    Some(url.replace("100x100bb", "600x600bb"))
}

/// Looks up a matching recording on MusicBrainz and returns a release id to query
/// the Cover Art Archive with. Used as a fallback when iTunes has no match.
async fn find_musicbrainz_release_id(client: &reqwest::Client, artist: &str, title: &str) -> Option<String> {
    let query = if artist.trim().is_empty() || artist == UNKNOWN_ARTIST {
        format!("recording:\"{title}\"")
    } else {
        format!("artist:\"{artist}\" AND recording:\"{title}\"")
    };
    let resp = client
        .get("https://musicbrainz.org/ws/2/recording/")
        .query(&[("query", query.as_str()), ("fmt", "json"), ("limit", "1")])
        .send()
        .await
        .ok()?;
    let parsed = resp.json::<MusicBrainzSearchResponse>().await.ok()?;
    let recording = parsed.recordings.into_iter().next()?;
    let release = recording.releases?.into_iter().next()?;
    Some(release.id)
}

async fn find_cover_art_archive_bytes(client: &reqwest::Client, release_id: &str) -> Option<Vec<u8>> {
    let resp = client
        .get(format!("https://coverartarchive.org/release/{release_id}/front"))
        .send()
        .await
        .ok()?;
    if !resp.status().is_success() {
        return None;
    }
    resp.bytes().await.ok().map(|b| b.to_vec())
}

/// Tries iTunes first, then falls back to MusicBrainz + the Cover Art Archive.
/// Returns the image bytes and whether MusicBrainz's search endpoint was hit
/// (so the caller can back off its rate limit).
async fn find_cover_bytes(client: &reqwest::Client, artist: &str, title: &str) -> (Option<Vec<u8>>, bool) {
    if let Some(url) = find_itunes_artwork_url(client, artist, title).await {
        if let Ok(resp) = client.get(&url).send().await {
            if let Ok(bytes) = resp.bytes().await {
                return (Some(bytes.to_vec()), false);
            }
        }
    }

    match find_musicbrainz_release_id(client, artist, title).await {
        Some(release_id) => (find_cover_art_archive_bytes(client, &release_id).await, true),
        None => (None, true),
    }
}

#[tauri::command]
pub async fn fetch_covers(
    app: AppHandle,
    db: State<'_, Db>,
    paths: State<'_, AppPaths>,
    song_ids: Vec<String>,
) -> Result<CoverFetchSummary, String> {
    let total = song_ids.len();
    let client = reqwest::Client::builder()
        .user_agent("Sonora/0.3.0 (desktop music player)")
        .build()
        .map_err(|e| e.to_string())?;
    let mut found = 0i64;
    let mut not_found = 0i64;

    for (i, song_id) in song_ids.iter().enumerate() {
        let (title, artist) = {
            let conn = db.0.lock().map_err(|e| e.to_string())?;
            conn.query_row(
                "SELECT title, artist FROM songs WHERE id = ?1",
                params![song_id],
                |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)),
            )
            .map_err(|e| e.to_string())?
        };

        let _ = app.emit(
            "cover-fetch-progress",
            CoverFetchProgress {
                current: i + 1,
                total,
                title: title.clone(),
            },
        );

        let (bytes, hit_musicbrainz) = find_cover_bytes(&client, &artist, &title).await;

        let saved = match bytes {
            Some(bytes) => {
                let dest = paths.covers_dir.join(format!("{song_id}.jpg"));
                fs::write(&dest, &bytes).is_ok() && {
                    let conn = db.0.lock().map_err(|e| e.to_string())?;
                    conn.execute(
                        "UPDATE songs SET cover_path = ?1 WHERE id = ?2",
                        params![dest.to_string_lossy().into_owned(), song_id],
                    )
                    .map_err(|e| e.to_string())?;
                    true
                }
            }
            None => false,
        };

        if saved {
            found += 1;
        } else {
            not_found += 1;
        }

        // MusicBrainz asks anonymous clients to stay under ~1 request/second;
        // iTunes has no such requirement, so we only slow down when we used it.
        let delay = if hit_musicbrainz { 1000 } else { 150 };
        tokio::time::sleep(Duration::from_millis(delay)).await;
    }

    Ok(CoverFetchSummary { found, not_found })
}
