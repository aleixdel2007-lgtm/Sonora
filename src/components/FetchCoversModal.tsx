import { listen } from "@tauri-apps/api/event";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { paletteFor } from "../format";
import { t } from "../i18n";
import { IconCheckCircle, IconSearch, IconWarning } from "../Icons";
import type { Song } from "../types";

interface Props {
  open: boolean;
  songsToEnrich: Song[];
  onClose: () => void;
  onDone: () => void;
  lang: string;
}

type Step = "form" | "loading" | "done";

export default function FetchCoversModal({ open, songsToEnrich, onClose, onDone, lang }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0, title: "" });
  const [summary, setSummary] = useState({ found: 0, not_found: 0 });
  const unlistenRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setStep("form");
      setSelectedIds(new Set());
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    return () => unlistenRef.current?.();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songsToEnrich;
    return songsToEnrich.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q),
    );
  }, [songsToEnrich, query]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));

  if (!open) return null;

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
      if (allFilteredSelected) filtered.forEach((s) => next.delete(s.id));
      else filtered.forEach((s) => next.add(s.id));
      return next;
    });
  }

  async function start() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setStep("loading");
    setProgress({ current: 0, total: ids.length, title: "" });

    unlistenRef.current = await listen<{ current: number; total: number; title: string }>(
      "cover-fetch-progress",
      (event) => setProgress(event.payload),
    );

    try {
      const result = await api.fetchCovers(ids);
      setSummary(result);
      setStep("done");
      onDone();
    } finally {
      unlistenRef.current?.();
    }
  }

  return (
    <div className="modal-backdrop" onClick={step === "loading" ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {step === "form" && (
          <>
            <h3>{t(lang, "coverFetch.title")}</h3>
            <div className="callout-warning">
              <IconWarning />
              <span>{t(lang, "coverFetch.warning")}</span>
            </div>

            {songsToEnrich.length === 0 ? (
              <div className="song-picker-empty">{t(lang, "coverFetch.emptyNone")}</div>
            ) : (
              <div className="field">
                <div className="song-picker-head">
                  <label>{t(lang, "coverFetch.chooseLabel")}</label>
                  {selectedIds.size > 0 && (
                    <span className="song-picker-count">
                      {selectedIds.size} {t(lang, "modal.songsSelected")}
                    </span>
                  )}
                </div>
                <div className="song-picker-search">
                  <IconSearch />
                  <input
                    type="text"
                    placeholder={t(lang, "modal.chooseSongsSearch")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="song-picker-toolbar">
                  <label className="song-picker-selectall">
                    <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} />
                    {t(lang, allFilteredSelected ? "modal.deselectAll" : "modal.selectAll")}
                  </label>
                </div>
                <div className="song-picker-list">
                  {filtered.map((song) => {
                    const [c1, c2] = paletteFor(song.id);
                    const selected = selectedIds.has(song.id);
                    return (
                      <label key={song.id} className={`song-picker-row ${selected ? "selected" : ""}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleSong(song.id)} />
                        <div className="cover-sm" style={{ "--c1": c1, "--c2": c2 } as React.CSSProperties} />
                        <div>
                          <div className="t-title">{song.title}</div>
                          <div className="t-artist">{song.artist}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn" onClick={onClose}>
                {t(lang, "modal.cancel")}
              </button>
              <button className="btn btn-accent" disabled={selectedIds.size === 0} onClick={start}>
                {t(lang, "coverFetch.button")}
              </button>
            </div>
          </>
        )}

        {step === "loading" && (
          <>
            <h3>{t(lang, "coverFetch.title")}</h3>
            <div className="fetch-progress">
              <div className="fetch-spinner" />
              <div className="fetch-progress-text">
                {t(lang, "coverFetch.processingWord")} {Math.min(progress.current, progress.total)} {t(lang, "coverFetch.ofWord")}{" "}
                {progress.total}
                {progress.title ? `: ${progress.title}` : "…"}
              </div>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <h3>{t(lang, "coverFetch.title")}</h3>
            <div className="fetch-result">
              <div className="fetch-result-icon">
                <IconCheckCircle />
              </div>
              <div className="fetch-result-title">
                {t(lang, "coverFetch.foundWord")} {summary.found} {t(lang, "coverFetch.ofWord")} {summary.found + summary.not_found}
              </div>
              <div className="fetch-result-sub">
                {summary.not_found > 0
                  ? `${t(lang, "coverFetch.notFoundPrefix")} ${summary.not_found} ${t(lang, "coverFetch.notFoundSuffix")}`
                  : t(lang, "coverFetch.allFoundSub")}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-accent" onClick={onClose}>
                {t(lang, "coverFetch.close")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
