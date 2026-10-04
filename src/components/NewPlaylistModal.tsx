import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { t } from "../i18n";
import { paletteFor } from "../format";
import { IconSearch, IconUpload } from "../Icons";
import type { Song } from "../types";

interface Props {
  open: boolean;
  songs: Song[];
  initialName?: string;
  initialCoverPath?: string | null;
  initialSongIds?: string[];
  onClose: () => void;
  onSubmit: (name: string, coverSourcePath: string | null, songIds: string[]) => void;
  lang: string;
}

export default function NewPlaylistModal({
  open,
  songs,
  initialName,
  initialCoverPath,
  initialSongIds,
  onClose,
  onSubmit,
  lang,
}: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialCoverPath ? convertFileSrc(initialCoverPath) : null,
  );
  const [coverSourcePath, setCoverSourcePath] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [songQuery, setSongQuery] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName ?? "");
      setCoverPreview(initialCoverPath ? convertFileSrc(initialCoverPath) : null);
      setCoverSourcePath(null);
      setSelectedIds(new Set(initialSongIds ?? []));
      setSongQuery("");
    }
  }, [open, initialName, initialCoverPath, initialSongIds]);

  const filteredSongs = useMemo(() => {
    const q = songQuery.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q),
    );
  }, [songs, songQuery]);

  const allFilteredSelected = filteredSongs.length > 0 && filteredSongs.every((s) => selectedIds.has(s.id));

  if (!open) return null;

  async function pickImage() {
    const path = await api.pickCoverImage();
    if (path) {
      setCoverSourcePath(path);
      setCoverPreview(convertFileSrc(path));
    }
  }

  function toggleSong(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredSongs.forEach((s) => next.delete(s.id));
      } else {
        filteredSongs.forEach((s) => next.add(s.id));
      }
      return next;
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initialName ? t(lang, "modal.editTitle") : t(lang, "modal.newTitle")}</h3>
        <button className={`upload-box ${coverPreview ? "has-image" : ""}`} onClick={pickImage} type="button">
          {coverPreview && <img src={coverPreview} alt="" />}
          <IconUpload />
          <span>{t(lang, "modal.uploadCover")}</span>
        </button>
        <div className="field">
          <label htmlFor="pl-name-input">{t(lang, "modal.nameLabel")}</label>
          <input
            id="pl-name-input"
            type="text"
            placeholder={t(lang, "modal.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <div className="song-picker-head">
            <label>{t(lang, "modal.chooseSongs")}</label>
            {selectedIds.size > 0 && (
              <span className="song-picker-count">
                {selectedIds.size} {t(lang, "modal.songsSelected")}
              </span>
            )}
          </div>

          {songs.length === 0 ? (
            <div className="song-picker-empty">{t(lang, "modal.noSongsToPick")}</div>
          ) : (
            <>
              <div className="song-picker-search">
                <IconSearch />
                <input
                  type="text"
                  placeholder={t(lang, "modal.chooseSongsSearch")}
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                />
              </div>

              <div className="song-picker-toolbar">
                <label className="song-picker-selectall">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} />
                  {t(lang, allFilteredSelected ? "modal.deselectAll" : "modal.selectAll")}
                </label>
              </div>

              <div className="song-picker-list">
                {filteredSongs.map((song) => {
                  const [c1, c2] = paletteFor(song.id);
                  const selected = selectedIds.has(song.id);
                  return (
                    <label key={song.id} className={`song-picker-row ${selected ? "selected" : ""}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleSong(song.id)} />
                      <div
                        className="cover-sm"
                        style={
                          song.cover_path
                            ? { backgroundImage: `url(${convertFileSrc(song.cover_path)})` }
                            : ({ "--c1": c1, "--c2": c2 } as React.CSSProperties)
                        }
                      />
                      <div>
                        <div className="t-title">{song.title}</div>
                        <div className="t-artist">{song.artist}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t(lang, "modal.cancel")}
          </button>
          <button
            className="btn btn-accent"
            disabled={!name.trim()}
            onClick={() => {
              if (!name.trim()) return;
              onSubmit(name.trim(), coverSourcePath, Array.from(selectedIds));
            }}
          >
            {initialName ? t(lang, "modal.save") : t(lang, "modal.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
