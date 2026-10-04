import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { api } from "../api";
import { t } from "../i18n";
import { IconUpload } from "../Icons";
import type { Song } from "../types";

interface Props {
  song: Song | null;
  onClose: () => void;
  onSaved: () => void;
  lang: string;
}

export default function EditSongModal({ song, onClose, onSaved, lang }: Props) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverSourcePath, setCoverSourcePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album);
      setCoverPreview(song.cover_path ? convertFileSrc(song.cover_path) : null);
      setCoverSourcePath(null);
    }
  }, [song]);

  if (!song) return null;

  async function pickImage() {
    const path = await api.pickCoverImage();
    if (path) {
      setCoverSourcePath(path);
      setCoverPreview(convertFileSrc(path));
    }
  }

  async function save() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await api.updateSong(song!.id, title.trim(), artist.trim(), album.trim(), coverSourcePath);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t(lang, "editSong.title")}</h3>
        <button className={`upload-box ${coverPreview ? "has-image" : ""}`} onClick={pickImage} type="button">
          {coverPreview && <img src={coverPreview} alt="" />}
          <IconUpload />
          <span>{t(lang, "editSong.uploadCover")}</span>
        </button>
        <div className="field">
          <label htmlFor="song-title-input">{t(lang, "editSong.titleLabel")}</label>
          <input id="song-title-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="song-artist-input">{t(lang, "editSong.artistLabel")}</label>
          <input id="song-artist-input" type="text" value={artist} onChange={(e) => setArtist(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="song-album-input">{t(lang, "editSong.albumLabel")}</label>
          <input id="song-album-input" type="text" value={album} onChange={(e) => setAlbum(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t(lang, "modal.cancel")}
          </button>
          <button className="btn btn-accent" disabled={!title.trim() || saving} onClick={save}>
            {t(lang, "modal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
