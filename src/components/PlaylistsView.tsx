import { convertFileSrc } from "@tauri-apps/api/core";
import { t } from "../i18n";
import { IconMusicNote, IconPlus } from "../Icons";
import { paletteFor, playlistMinutes } from "../format";
import type { Playlist } from "../types";

interface Props {
  playlists: Playlist[];
  onOpen: (id: string) => void;
  onNew: () => void;
  lang: string;
}

export default function PlaylistsView({ playlists, onOpen, onNew, lang }: Props) {
  return (
    <main className="main">
      <div className="main-head">
        <h1 className="page-title">{t(lang, "playlists.title")}</h1>
      </div>
      <div className="pl-grid">
        {playlists.map((p) => {
          const [c1, c2] = paletteFor(p.id);
          return (
            <button key={p.id} className="pl-card" onClick={() => onOpen(p.id)}>
              <div
                className="pl-cover"
                style={
                  p.cover_path
                    ? { backgroundImage: `url(${convertFileSrc(p.cover_path)})` }
                    : ({ "--c1": c1, "--c2": c2 } as React.CSSProperties)
                }
              >
                {!p.cover_path && <IconMusicNote />}
              </div>
              <div className="pl-name">{p.name}</div>
              <div className="pl-count">
                {p.song_count} {t(lang, "songsUnit")} · {playlistMinutes(p.total_duration_secs)} {t(lang, "minutesUnit")}
              </div>
            </button>
          );
        })}
        <button className="pl-new" onClick={onNew}>
          <IconPlus />
          {t(lang, "playlists.new")}
        </button>
      </div>
    </main>
  );
}
