type IconProps = { className?: string };

export const IconLibrary = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><path d="M4 6h16M4 12h16M4 18h10" /></svg>
);

export const IconPlaylists = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><path d="M12 5v14M5 12h14" /></svg>
);

export const IconGear = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);

export const IconMusicNote = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" stroke="none">
    <path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const IconShuffle = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h4l9 12h5M3 18h4l9-12h5" />
  </svg>
);

export const IconPrev = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><path d="M6 5v14M18 6l-10 6 10 6z" /></svg>
);

export const IconNext = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><path d="M18 5v14M6 6l10 6-10 6z" /></svg>
);

export const IconPlay = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><path d="M6 4l14 8-14 8z" /></svg>
);

export const IconPause = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
);

export const IconRepeat = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

export const IconVolume = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className}>
    <path d="M4 9v6h4l5 5V4L8 9z" />
    <path d="M17 8a5 5 0 010 8" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const IconUpload = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="3" y="5" width="18" height="15" rx="2" />
    <circle cx="12" cy="12.5" r="3.2" />
    <path d="M8 5l1.5-2h5L16 5" />
  </svg>
);

export const IconEdit = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
