use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Song {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration_secs: i64,
    pub file_path: String,
    pub cover_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Playlist {
    pub id: String,
    pub name: String,
    pub cover_path: Option<String>,
    pub song_count: i64,
    pub total_duration_secs: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub theme: String,
    pub language: String,
    pub density: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            theme: "auto".into(),
            language: "es".into(),
            density: "comfortable".into(),
        }
    }
}
