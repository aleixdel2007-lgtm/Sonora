import { invoke } from "@tauri-apps/api/core";
import type { Playlist, Settings, Song } from "./types";

export const api = {
  listSongs: () => invoke<Song[]>("list_songs"),
  importSongs: () => invoke<Song[]>("import_songs"),
  updateSong: (id: string, title: string, artist: string, album: string, coverSourcePath: string | null) =>
    invoke<void>("update_song", { id, title, artist, album, coverSourcePath }),
  pickCoverImage: () => invoke<string | null>("pick_cover_image"),

  listPlaylists: () => invoke<Playlist[]>("list_playlists"),
  createPlaylist: (name: string, coverSourcePath: string | null) =>
    invoke<Playlist>("create_playlist", { name, coverSourcePath }),
  updatePlaylist: (id: string, name: string, coverSourcePath: string | null) =>
    invoke<void>("update_playlist", { id, name, coverSourcePath }),
  deletePlaylist: (id: string) => invoke<void>("delete_playlist", { id }),

  getPlaylistSongs: (playlistId: string) =>
    invoke<Song[]>("get_playlist_songs", { playlistId }),
  addSongsToPlaylist: (playlistId: string, songIds: string[]) =>
    invoke<void>("add_songs_to_playlist", { playlistId, songIds }),
  removeSongFromPlaylist: (playlistId: string, songId: string) =>
    invoke<void>("remove_song_from_playlist", { playlistId, songId }),

  getSettings: () => invoke<Settings>("get_settings"),
  setSettings: (settings: Settings) => invoke<void>("set_settings", { settings }),
};
