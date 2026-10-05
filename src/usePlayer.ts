import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Song } from "./types";

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeatOne, setRepeatOne] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const current = index >= 0 ? queue[index] : null;

  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatOne) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      next();
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, index, repeatOne, shuffle]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  function playQueue(songs: Song[], startIndex: number) {
    setQueue(songs);
    setIndex(startIndex);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!current) return;
    audio.src = convertFileSrc(current.file_path);
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  function toggle() {
    const audio = audioRef.current;
    if (!current) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function next() {
    if (index < 0 || queue.length === 0) return;
    if (shuffle) {
      if (queue.length <= 1) return;
      let nextIndex = index;
      while (nextIndex === index) nextIndex = Math.floor(Math.random() * queue.length);
      setIndex(nextIndex);
      return;
    }
    if (index + 1 >= queue.length) return;
    setIndex(index + 1);
  }

  function prev() {
    if (index <= 0) return;
    setIndex(index - 1);
  }

  function seek(time: number) {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  function toggleRepeatOne() {
    setRepeatOne((r) => !r);
  }

  function toggleShuffle() {
    setShuffle((s) => !s);
  }

  return useMemo(
    () => ({
      current,
      isPlaying,
      currentTime,
      duration,
      volume,
      repeatOne,
      shuffle,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleRepeatOne,
      toggleShuffle,
    }),
    [current, isPlaying, currentTime, duration, volume, queue, index, repeatOne, shuffle],
  );
}
