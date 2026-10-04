import { convertFileSrc } from "@tauri-apps/api/core";
import { t } from "../i18n";
import { IconClose, IconEdit, IconPlay } from "../Icons";
import { formatDuration, paletteFor, playlistMinutes } from "../format";
import type { Playlist, Song } from "../types";

interface Props {
  playlist: Playlist;
  songs: Song[];
  currentSongId: string | null;
  onBack: () => void;
  onPlayAll: () => void;
  onPlaySong: (song: Song, index: number) => void;
  onRemoveSong: (songId: string) => void;
  onEditSong: (song: Song) => void;
  onEdit: () => void;
  lang: string;
}

export default function PlaylistDetailView({
  playlist,
  songs,
  currentSongId,
  onBack,
  onPlayAll,
  onPlaySong,
  onRemoveSong,
  onEditSong,
  onEdit,
  lang,
}: Props) {
  const [c1, c2] = paletteFor(playlist.id);

  return (
    <main className="main">
      <div className="pl-detail-head">
        <div
          className="pl-detail-cover"
          style={
            playlist.cover_path
              ? { backgroundImage: `url(${convertFileSrc(playlist.cover_path)})` }
              : ({ "--c1": c1, "--c2": c2 } as React.CSSProperties)
          }
        />
        <div className="pl-detail-meta">
          <span className="pl-detail-eyebrow">{t(lang, "playlistDetail.eyebrow")}</span>
          <h1 className="page-title">{playlist.name}</h1>
          <span className="pl-detail-sub">
            {playlist.song_count} {t(lang, "songsUnit")} · {playlistMinutes(playlist.total_duration_secs)} {t(lang, "minutesUnit")}
          </span>
          <div className="pl-detail-actions">
            <button className="btn btn-accent" onClick={onPlayAll} disabled={songs.length === 0}>
              <IconPlay />
              {t(lang, "playlistDetail.playAll")}
            </button>
            <button className="btn" onClick={onEdit}>
              {t(lang, "playlistDetail.edit")}
            </button>
            <button className="btn" onClick={onBack}>
              {t(lang, "playlistDetail.back")}
            </button>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="empty-state">{t(lang, "playlistDetail.empty")}</div>
      ) : (
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
                      <button
                        className="track-row-remove"
                        style={{ opacity: 1 }}
                        title={t(lang, "removeFromPlaylist")}
                        onClick={() => onRemoveSong(song.id)}
                      >
                        <IconClose />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
