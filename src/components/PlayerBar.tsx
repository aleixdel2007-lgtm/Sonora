import { convertFileSrc } from "@tauri-apps/api/core";
import { useRef } from "react";
import { t } from "../i18n";
import { IconNext, IconPause, IconPlay, IconPrev, IconRepeat, IconShuffle, IconVolume } from "../Icons";
import { formatDuration, paletteFor } from "../format";
import type { usePlayer } from "../usePlayer";

interface Props {
  player: ReturnType<typeof usePlayer>;
  lang: string;
}

export default function PlayerBar({ player, lang }: Props) {
  const { current, isPlaying, currentTime, duration, volume, toggle, next, prev, seek, setVolume } = player;
  const seekRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? currentTime / duration : 0;
  const [c1, c2] = current ? paletteFor(current.id) : ["#ccc", "#999"];

  function handleSeekClick(e: React.MouseEvent) {
    if (!seekRef.current || !duration) return;
    const rect = seekRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  }

  function handleVolClick(e: React.MouseEvent) {
    if (!volRef.current) return;
    const rect = volRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
  }

  return (
    <div className="player">
      <div className="now-playing">
        <div
          className="now-cover"
          style={
            current?.cover_path
              ? { backgroundImage: `url(${convertFileSrc(current.cover_path)})` }
              : ({ "--c1": c1, "--c2": c2 } as React.CSSProperties)
          }
        />
        <div className="now-meta">
          <div className="now-title">{current?.title ?? t(lang, "player.nothing")}</div>
          <div className="now-artist">{current?.artist ?? t(lang, "player.chooseSong")}</div>
        </div>
      </div>

      <div className="transport">
        <div className="transport-btns">
          <button className="tbtn" aria-label="Aleatorio" disabled>
            <IconShuffle />
          </button>
          <button className="tbtn" aria-label="Anterior" onClick={prev} disabled={!current}>
            <IconPrev />
          </button>
          <button className="tbtn play" aria-label={isPlaying ? "Pausar" : "Reproducir"} onClick={toggle} disabled={!current}>
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button className="tbtn" aria-label="Siguiente" onClick={next} disabled={!current}>
            <IconNext />
          </button>
          <button className="tbtn" aria-label="Repetir" disabled>
            <IconRepeat />
          </button>
        </div>
        <div className="seek-row">
          <span className="seek-time mono">{formatDuration(currentTime)}</span>
          <div className="seek-track" ref={seekRef} onClick={handleSeekClick}>
            <div className="seek-fill" style={{ width: `${progress * 100}%` }} />
            <div className="seek-knob" style={{ left: `${progress * 100}%` }} />
          </div>
          <span className="seek-time mono">{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="aux-controls">
        <button className="tbtn" aria-label="Volumen">
          <IconVolume />
        </button>
        <div className="vol-track" ref={volRef} onClick={handleVolClick}>
          <div className="vol-fill" style={{ width: `${volume * 100}%` }} />
          <div className="vol-knob" style={{ left: `${volume * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
