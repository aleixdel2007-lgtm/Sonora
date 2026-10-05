import { convertFileSrc } from "@tauri-apps/api/core";
import { useState } from "react";
import { api } from "../api";
import { t } from "../i18n";
import { IconCoverSearch, IconEdit, IconPlay, IconUpload } from "../Icons";
import { formatDuration, paletteFor, playlistMinutes } from "../format";
import type { Song } from "../types";

interface Props {
  artist: string;
  songs: Song[];
  imagePath: string | null;
  currentSongId: string | null;
  onBack: () => void;
  onPlayAll: () => void;
  onPlaySong: (song: Song, index: number) => void;
  onEditSong: (song: Song) => void;
  onImageUpdated: () => void;
  lang: string;
}

export default function ArtistDetailView({
  artist,
  songs,
  imagePath,
  currentSongId,
  onBack,
  onPlayAll,
  onPlaySong,
  onEditSong,
  onImageUpdated,
  lang,
}: Props) {
  const [c1, c2] = paletteFor(artist);
  const [searching, setSearching] = useState(false);
  const totalDurationSecs = songs.reduce((sum, s) => sum + s.duration_secs, 0);

  async function searchImage() {
    if (searching) return;
    setSearching(true);
    try {
      const found = await api.searchArtistImage(artist);
      if (found) onImageUpdated();
    } finally {
      setSearching(false);
    }
  }

  async function uploadImage() {
    const path = await api.pickCoverImage();
    if (!path) return;
    await api.setArtistImage(artist, path);
    onImageUpdated();
  }

  return (
    <main className="main">
      <div className="pl-detail-head">
        <div
          className="pl-detail-cover"
          style={
            imagePath
              ? { backgroundImage: `url(${convertFileSrc(imagePath)})` }
              : ({ "--c1": c1, "--c2": c2 } as React.CSSProperties)
          }
        />
        <div className="pl-detail-meta">
          <span className="pl-detail-eyebrow">{t(lang, "artistDetail.eyebrow")}</span>
          <h1 className="page-title">{artist}</h1>
          <span className="pl-detail-sub">
            {songs.length} {t(lang, "songsUnit")} · {playlistMinutes(totalDurationSecs)} {t(lang, "minutesUnit")}
          </span>
          <div className="pl-detail-actions">
            <button className="btn btn-accent" onClick={onPlayAll} disabled={songs.length === 0}>
              <IconPlay />
              {t(lang, "playlistDetail.playAll")}
            </button>
            <button className="btn" onClick={searchImage} disabled={searching}>
              <IconCoverSearch />
              {searching ? t(lang, "artistDetail.searching") : t(lang, "artistDetail.searchImage")}
            </button>
            <button className="btn" onClick={uploadImage}>
              <IconUpload />
              {t(lang, "artistDetail.uploadImage")}
            </button>
            <button className="btn" onClick={onBack}>
              {t(lang, "playlistDetail.back")}
            </button>
          </div>
        </div>
      </div>

      <table className="track-table">
        <thead>
          <tr>
            <th className="num">#</th>
            <th>{t(lang, "col.title")}</th>
            <th>{t(lang, "col.album")}</th>
            <th className="dur">{t(lang, "col.duration")}</th>
            <th className="track-actions"></th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, i) => {
            const [sc1, sc2] = paletteFor(song.id);
            const playing = song.id === currentSongId;
            return (
              <tr key={song.id} className={`track-row ${playing ? "playing" : ""}`} onClick={() => onPlaySong(song, i)}>
                <td className="track-num mono">{i + 1}</td>
                <td>
                  <div className="track-title-cell">
                    <div
                      className="cover-sm"
                      style={
                        song.cover_path
                          ? { backgroundImage: `url(${convertFileSrc(song.cover_path)})` }
                          : ({ "--c1": sc1, "--c2": sc2 } as React.CSSProperties)
                      }
                    />
                    <div>
                      <div className="t-title">{song.title}</div>
                      <div className="t-artist">{song.artist}</div>
                    </div>
                  </div>
                </td>
                <td className="track-album">{song.album}</td>
                <td className="track-dur mono">{formatDuration(song.duration_secs)}</td>
                <td className="track-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="track-actions-group">
                    <button
                      className="track-row-remove"
                      style={{ opacity: 1 }}
                      title={t(lang, "editSong.tooltip")}
                      onClick={() => onEditSong(song)}
                    >
                      <IconEdit />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
