import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { IconPlus } from "../Icons";
import type { Playlist } from "../types";

interface Props {
  playlists: Playlist[];
  onAdd: (playlistId: string) => void;
  lang: string;
}

export default function AddToPlaylistMenu({ playlists, onAdd, lang }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="menu-anchor" ref={ref}>
      <button
        className="track-row-remove"
        style={{ opacity: 1 }}
        title={t(lang, "menu.addToPlaylist")}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <IconPlus />
      </button>
      {open && (
        <div className="menu" onClick={(e) => e.stopPropagation()}>
          {playlists.length === 0 ? (
            <div className="menu-empty">{t(lang, "menu.noPlaylists")}</div>
          ) : (
            playlists.map((p) => (
              <button
                key={p.id}
                className="menu-item"
                onClick={() => {
                  onAdd(p.id);
                  setOpen(false);
                }}
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
