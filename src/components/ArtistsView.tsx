import { convertFileSrc } from "@tauri-apps/api/core";
import { useState } from "react";
import { api } from "../api";
import { t } from "../i18n";
import { IconRefresh, IconUser } from "../Icons";
import { groupByArtist, paletteFor, playlistMinutes } from "../format";
import type { Song } from "../types";

interface Props {
  songs: Song[];
  artistImages: Record<string, string>;
  onOpen: (artist: string) => void;
  onImagesUpdated: () => void;
  lang: string;
}

export default function ArtistsView({ songs, artistImages, onOpen, onImagesUpdated, lang }: Props) {
  const artists = groupByArtist(songs);
  const missing = artists.filter((a) => !artistImages[a.name]);
  const [updating, setUpdating] = useState(false);

  async function updateImages() {
    if (missing.length === 0 || updating) return;
    setUpdating(true);
    try {
      await api.fetchArtistImages(missing.map((a) => a.name));
      onImagesUpdated();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="main">
      <div className="main-head">
        <h1 className="page-title">{t(lang, "artists.title")}</h1>
        <div className="spacer" />
        {artists.length > 0 && (
          <button className="btn" onClick={updateImages} disabled={updating || missing.length === 0}>
            <IconRefresh />
            {updating ? t(lang, "artists.updating") : t(lang, "artists.update")}
          </button>
        )}
      </div>
      {artists.length === 0 ? (
        <div className="empty-state">{t(lang, "library.empty")}</div>
      ) : (
        <div className="pl-grid">
          {artists.map((artist) => {
            const [c1, c2] = paletteFor(artist.name);
            const imagePath = artistImages[artist.name];
            return (
              <button key={artist.name} className="pl-card" onClick={() => onOpen(artist.name)}>
                <div
                  className="pl-cover"
                  style={
                    imagePath
                      ? { backgroundImage: `url(${convertFileSrc(imagePath)})` }
                      : ({ "--c1": c1, "--c2": c2 } as React.CSSProperties)
                  }
                >
                  {!imagePath && <IconUser />}
                </div>
                <div className="pl-name">{artist.name}</div>
                <div className="pl-count">
                  {artist.songCount} {t(lang, "songsUnit")} · {playlistMinutes(artist.totalDurationSecs)} {t(lang, "minutesUnit")}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
