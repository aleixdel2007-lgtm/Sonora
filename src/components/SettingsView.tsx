import { useEffect, useState } from "react";
import { LANGUAGE_OPTIONS, t } from "../i18n";
import type { Settings } from "../types";

interface Props {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export default function SettingsView({ settings, onSave }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [justSaved, setJustSaved] = useState(false);
  const lang = draft.language;

  useEffect(() => setDraft(settings), [settings]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  function save() {
    onSave(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <main className="main">
      <div className="main-head">
        <h1 className="page-title">{t(lang, "settings.title")}</h1>
        <div className="spacer" />
        {justSaved && !dirty && <span className="settings-row-desc">{t(lang, "settings.saved")}</span>}
        <button className="btn btn-accent" disabled={!dirty} onClick={save}>
          {t(lang, "settings.save")}
        </button>
      </div>

      <div className="settings-wrap">
        <div className="settings-section">
          <h2>{t(lang, "settings.appearance")}</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-row-title">{t(lang, "settings.theme")}</span>
                <span className="settings-row-desc">{t(lang, "settings.themeDesc")}</span>
              </div>
              <div className="seg-control">
                {[
                  { key: "light", label: t(lang, "settings.themeLight") },
                  { key: "dark", label: t(lang, "settings.themeDark") },
                  { key: "auto", label: t(lang, "settings.themeAuto") },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    className={`seg-btn ${draft.theme === opt.key ? "active" : ""}`}
                    onClick={() => setDraft({ ...draft, theme: opt.key as Settings["theme"] })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-row-title">{t(lang, "settings.language")}</span>
                <span className="settings-row-desc">{t(lang, "settings.languageDesc")}</span>
              </div>
              <select
                className="select"
                value={draft.language}
                onChange={(e) => setDraft({ ...draft, language: e.target.value })}
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-row-title">{t(lang, "settings.density")}</span>
                <span className="settings-row-desc">{t(lang, "settings.densityDesc")}</span>
              </div>
              <div className="seg-control">
                {[
                  { key: "comfortable", label: t(lang, "settings.densityComfortable") },
                  { key: "compact", label: t(lang, "settings.densityCompact") },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    className={`seg-btn ${draft.density === opt.key ? "active" : ""}`}
                    onClick={() => setDraft({ ...draft, density: opt.key as Settings["density"] })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t(lang, "settings.about")}</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-row-title">{t(lang, "settings.version")}</span>
                <span className="settings-row-desc">{t(lang, "settings.versionDesc")}</span>
              </div>
              <span className="version-pill mono">v0.2.0</span>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-row-title">{t(lang, "settings.updates")}</span>
                <span className="settings-row-desc">{t(lang, "settings.updatesDesc")}</span>
              </div>
              <button className="btn" disabled>
                {t(lang, "settings.checkUpdates")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
