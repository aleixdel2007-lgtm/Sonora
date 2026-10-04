import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { api } from "../api";
import { t } from "../i18n";
import { IconUpload } from "../Icons";

interface Props {
  open: boolean;
  initialName?: string;
  initialCoverPath?: string | null;
  onClose: () => void;
  onSubmit: (name: string, coverSourcePath: string | null) => void;
  lang: string;
}

export default function NewPlaylistModal({ open, initialName, initialCoverPath, onClose, onSubmit, lang }: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialCoverPath ? convertFileSrc(initialCoverPath) : null,
  );
  const [coverSourcePath, setCoverSourcePath] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName ?? "");
      setCoverPreview(initialCoverPath ? convertFileSrc(initialCoverPath) : null);
      setCoverSourcePath(null);
    }
  }, [open, initialName, initialCoverPath]);

  if (!open) return null;

  async function pickImage() {
    const path = await api.pickCoverImage();
    if (path) {
      setCoverSourcePath(path);
      setCoverPreview(convertFileSrc(path));
    }
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
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t(lang, "modal.cancel")}
          </button>
          <button
            className="btn btn-accent"
            disabled={!name.trim()}
            onClick={() => {
              if (!name.trim()) return;
              onSubmit(name.trim(), coverSourcePath);
            }}
          >
            {initialName ? t(lang, "modal.save") : t(lang, "modal.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
