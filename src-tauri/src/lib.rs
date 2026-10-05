mod commands;
mod db;
mod models;

use commands::AppPaths;
use db::Db;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("resolve app data dir");

            let music_dir = app_data_dir.join("music");
            let covers_dir = app_data_dir.join("covers");
            std::fs::create_dir_all(&music_dir).expect("create music dir");
            std::fs::create_dir_all(&covers_dir).expect("create covers dir");

            let conn = db::init_db(&app_data_dir);
            app.manage(Db(Mutex::new(conn)));
            app.manage(AppPaths {
                music_dir,
                covers_dir,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_songs,
            commands::import_songs,
            commands::update_song,
            commands::delete_song,
            commands::pick_cover_image,
            commands::list_playlists,
            commands::create_playlist,
            commands::update_playlist,
            commands::delete_playlist,
            commands::get_playlist_songs,
            commands::add_songs_to_playlist,
            commands::remove_song_from_playlist,
            commands::get_settings,
            commands::set_settings,
            commands::fetch_covers,
            commands::list_artist_images,
            commands::search_artist_image,
            commands::set_artist_image,
            commands::fetch_artist_images,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
