import { convertFileSrc } from "@tauri-apps/api/core";
import { useMemo, useState } from "react";
import { t } from "../i18n";
import { IconCoverSearch, IconEdit, IconPlus, IconSearch } from "../Icons";
import { formatDuration, paletteFor } from "../format";
import type { Playlist, Song } from "../types";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

interface Props {
  songs: Song[];
  playlists: Playlist[];
  currentSongId: string | null;
  onPlaySong: (song: Song, index: number, list: Song[]) => void;
  onAddSongs: () => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onEditSong: (song: Song) => void;
  onFetchCovers: () => void;
  lang: string;
}

export default function LibraryView({
  songs,
  playlists,
  currentSongId,
  onPlaySong,
  onAddSongs,
  onAddToPlaylist,
  onEditSong,
  onFetchCovers,
  lang,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q),
    );
  }, [songs, query]);

  return (
    <main className="main">
      <div className="main-head">
        <h1 className="page-title">{t(lang, "library.title")}</h1>
        <div className="spacer" />
        <div className="search">
          <IconSearch />
          <input
            type="text"
            placeholder={t(lang, "library.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn" onClick={onFetchCovers}>
          <IconCoverSearch />
          {t(lang, "coverFetch.button")}
        </button>
        <button className="btn btn-accent" onClick={onAddSongs}>
          <IconPlus />
          {t(lang, "nav.addSongs")}
        </button>
      </div>

      {songs.length === 0 ? (
        <div className="empty-state">{t(lang, "library.empty")}</div>
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
            {filtered.map((song, i) => {
              const [c1, c2] = paletteFor(song.id);
              const playing = song.id === currentSongId;
              return (
                <tr
                  key={song.id}
                  className={`track-row ${playing ? "playing" : ""}`}
                  onClick={() => onPlaySong(song, i, filtered)}
                >
                  <td className="track-num mono">{i + 1}</td>
                  <td>
                    <div className="track-title-cell">
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
                      <AddToPlaylistMenu playlists={playlists} onAdd={(pid) => onAddToPlaylist(pid, song.id)} lang={lang} />
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
