import { useEffect, useState } from "react";
import "./App.css";
import { api } from "./api";
import EditSongModal from "./components/EditSongModal";
import LibraryView from "./components/LibraryView";
import NewPlaylistModal from "./components/NewPlaylistModal";
import PlayerBar from "./components/PlayerBar";
import PlaylistDetailView from "./components/PlaylistDetailView";
import PlaylistsView from "./components/PlaylistsView";
import SettingsView from "./components/SettingsView";
import Sidebar from "./components/Sidebar";
import type { Playlist, Settings, Song, View } from "./types";
import { usePlayer } from "./usePlayer";

const DEFAULT_SETTINGS: Settings = { theme: "auto", language: "es", density: "comfortable" };

function App() {
  const [view, setView] = useState<View>({ name: "library" });
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; playlist: Playlist } | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const player = usePlayer();

  useEffect(() => {
    api.listSongs().then(setSongs).catch(console.error);
    api.listPlaylists().then(setPlaylists).catch(console.error);
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  useEffect(() => {
    if (view.name === "playlist-detail") {
      api.getPlaylistSongs(view.playlistId).then(setPlaylistSongs).catch(console.error);
    }
  }, [view]);

  // CSS theme tokens are keyed off `:root[data-theme]`, which only ever matches
  // the <html> element — it must be set there, not on an inner div.
  useEffect(() => {
    if (settings.theme === "auto") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", settings.theme);
    }
  }, [settings.theme]);

  function refreshPlaylists() {
    api.listPlaylists().then(setPlaylists).catch(console.error);
  }

  function refreshSongs() {
    api.listSongs().then(setSongs).catch(console.error);
    if (view.name === "playlist-detail") {
      api.getPlaylistSongs(view.playlistId).then(setPlaylistSongs).catch(console.error);
    }
  }

  async function handleAddSongs() {
    const updated = await api.importSongs();
    setSongs(updated);
  }

  function handleSaveSettings(next: Settings) {
    setSettings(next);
    api.setSettings(next).catch(console.error);
  }

  async function handleAddSongToPlaylist(playlistId: string, songId: string) {
    await api.addSongsToPlaylist(playlistId, [songId]);
    refreshPlaylists();
    if (view.name === "playlist-detail" && view.playlistId === playlistId) {
      api.getPlaylistSongs(playlistId).then(setPlaylistSongs);
    }
  }

  async function handleRemoveSongFromPlaylist(playlistId: string, songId: string) {
    await api.removeSongFromPlaylist(playlistId, songId);
    refreshPlaylists();
    api.getPlaylistSongs(playlistId).then(setPlaylistSongs);
  }

  async function handleCreateOrEditPlaylist(name: string, coverSourcePath: string | null, songIds: string[]) {
    if (modal?.mode === "edit") {
      const playlistId = modal.playlist.id;
      await api.updatePlaylist(playlistId, name, coverSourcePath);
      const existing = new Set(playlistSongs.map((s) => s.id));
      const selected = new Set(songIds);
      const toAdd = songIds.filter((id) => !existing.has(id));
      const toRemove = [...existing].filter((id) => !selected.has(id));
      if (toAdd.length) await api.addSongsToPlaylist(playlistId, toAdd);
      for (const id of toRemove) await api.removeSongFromPlaylist(playlistId, id);
      api.getPlaylistSongs(playlistId).then(setPlaylistSongs);
    } else {
      const playlist = await api.createPlaylist(name, coverSourcePath);
      if (songIds.length) await api.addSongsToPlaylist(playlist.id, songIds);
    }
    setModal(null);
    refreshPlaylists();
  }

  const currentPlaylist = view.name === "playlist-detail" ? playlists.find((p) => p.id === view.playlistId) : undefined;
  const lang = settings.language;

  return (
    <div className={`app ${settings.density === "compact" ? "density-compact" : ""}`}>
      <Sidebar view={view} playlists={playlists} onNavigate={setView} onAddSongs={handleAddSongs} lang={lang} />

      {view.name === "library" && (
        <LibraryView
          songs={songs}
          playlists={playlists}
          currentSongId={player.current?.id ?? null}
          onPlaySong={(_song, index, list) => player.playQueue(list, index)}
          onAddSongs={handleAddSongs}
          onAddToPlaylist={handleAddSongToPlaylist}
          onEditSong={setEditingSong}
          lang={lang}
        />
      )}

      {view.name === "playlists" && (
        <PlaylistsView
          playlists={playlists}
          onOpen={(id) => setView({ name: "playlist-detail", playlistId: id })}
          onNew={() => setModal({ mode: "create" })}
          lang={lang}
        />
      )}

      {view.name === "playlist-detail" && currentPlaylist && (
        <PlaylistDetailView
          playlist={currentPlaylist}
          songs={playlistSongs}
          currentSongId={player.current?.id ?? null}
          onBack={() => setView({ name: "playlists" })}
          onPlayAll={() => player.playQueue(playlistSongs, 0)}
          onPlaySong={(_song, index) => player.playQueue(playlistSongs, index)}
          onRemoveSong={(songId) => handleRemoveSongFromPlaylist(currentPlaylist.id, songId)}
          onEditSong={setEditingSong}
          onEdit={() => setModal({ mode: "edit", playlist: currentPlaylist })}
          lang={lang}
        />
      )}

      {view.name === "settings" && <SettingsView settings={settings} onSave={handleSaveSettings} />}

      <PlayerBar player={player} lang={lang} />

      <NewPlaylistModal
        open={modal !== null}
        songs={songs}
        initialName={modal?.mode === "edit" ? modal.playlist.name : undefined}
        initialCoverPath={modal?.mode === "edit" ? modal.playlist.cover_path : undefined}
        initialSongIds={modal?.mode === "edit" ? playlistSongs.map((s) => s.id) : undefined}
        onClose={() => setModal(null)}
        onSubmit={handleCreateOrEditPlaylist}
        lang={lang}
      />

      <EditSongModal
        song={editingSong}
        onClose={() => setEditingSong(null)}
        onSaved={() => {
          setEditingSong(null);
          refreshSongs();
        }}
        lang={lang}
      />
    </div>
  );
}

export default App;
