export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration_secs: number;
  file_path: string;
  cover_path: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  cover_path: string | null;
  song_count: number;
  total_duration_secs: number;
}

export interface Settings {
  theme: "light" | "dark" | "auto";
  language: string;
  density: "comfortable" | "compact";
}

export type View =
  | { name: "library" }
  | { name: "playlists" }
  | { name: "playlist-detail"; playlistId: string }
  | { name: "settings" };
