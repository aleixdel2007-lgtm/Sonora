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
