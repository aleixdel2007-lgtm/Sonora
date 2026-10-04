import { convertFileSrc } from "@tauri-apps/api/core";
import { t } from "../i18n";
import { IconGear, IconLibrary, IconMusicNote, IconPlaylists, IconPlus } from "../Icons";
import { paletteFor } from "../format";
import type { Playlist, View } from "../types";

interface Props {
  view: View;
  playlists: Playlist[];
  onNavigate: (view: View) => void;
  onAddSongs: () => void;
  lang: string;
}

export default function Sidebar({ view, playlists, onNavigate, onAddSongs, lang }: Props) {
  const isLibrary = view.name === "library";
  const isPlaylists = view.name === "playlists" || view.name === "playlist-detail";
  const isSettings = view.name === "settings";

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <IconMusicNote />
        </span>
        <span className="brand-name">Sonora</span>
      </div>

      <nav className="nav-group">
        <button className={`nav-item ${isLibrary ? "active" : ""}`} onClick={() => onNavigate({ name: "library" })}>
          <IconLibrary />
          {t(lang, "nav.library")}
        </button>
        <button className={`nav-item ${isPlaylists ? "active" : ""}`} onClick={() => onNavigate({ name: "playlists" })}>
          <IconPlaylists />
          {t(lang, "nav.playlists")}
        </button>
        <button className="nav-item" onClick={onAddSongs}>
          <IconPlus />
          {t(lang, "nav.addSongs")}
        </button>
      </nav>

      <div className="nav-group" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div className="nav-label">{t(lang, "nav.yourPlaylists")}</div>
        <div className="playlist-mini-list">
          {playlists.map((p) => {
            const active = view.name === "playlist-detail" && view.playlistId === p.id;
            const [c1, c2] = paletteFor(p.id);
            return (
              <button
                key={p.id}
                className={`playlist-mini ${active ? "active" : ""}`}
                onClick={() => onNavigate({ name: "playlist-detail", playlistId: p.id })}
              >
                <div
                  className="pl-swatch"
                  style={
                    p.cover_path
                      ? { backgroundImage: `url(${convertFileSrc(p.cover_path)})`, backgroundSize: "cover" }
                      : { background: `linear-gradient(145deg,${c1},${c2})` }
                  }
                />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-foot">
        <button className={`nav-item ${isSettings ? "active" : ""}`} onClick={() => onNavigate({ name: "settings" })}>
          <IconGear />
          {t(lang, "nav.settings")}
        </button>
      </div>
    </aside>
  );
}
