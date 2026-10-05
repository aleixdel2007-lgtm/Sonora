import type { Song } from "./types";

// Placeholders the Rust backend writes when a file has no readable tag for that field
// (src-tauri/src/commands.rs). A song still showing one of these is missing real data.
export const UNKNOWN_ARTIST = "Artista desconocido";
export const UNKNOWN_ALBUM = "Álbum desconocido";

export function isMissingMetadata(song: { artist: string; album: string; cover_path: string | null }): boolean {
  return !song.cover_path || song.artist === UNKNOWN_ARTIST || song.album === UNKNOWN_ALBUM;
}

export function formatDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function playlistMinutes(totalSeconds: number): number {
  return Math.round(totalSeconds / 60);
}

const PALETTES: [string, string][] = [
  ["#E9A23B", "#B86E0C"],
  ["#6C8CF5", "#3B52B4"],
  ["#6FC0A6", "#2E8468"],
  ["#E07AC0", "#A9448F"],
  ["#8C8CF0", "#4F4FBF"],
  ["#E4B23B", "#9E6A10"],
];

export function paletteFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

export interface ArtistSummary {
  name: string;
  songCount: number;
  totalDurationSecs: number;
}

export function groupByArtist(songs: Song[]): ArtistSummary[] {
  const map = new Map<string, ArtistSummary>();
  for (const song of songs) {
    const entry = map.get(song.artist) ?? { name: song.artist, songCount: 0, totalDurationSecs: 0 };
    entry.songCount += 1;
    entry.totalDurationSecs += song.duration_secs;
    map.set(song.artist, entry);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
