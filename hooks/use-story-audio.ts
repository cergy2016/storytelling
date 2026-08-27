"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;

interface UseStoryAudioOptions {
  paragraphs: string[];
  onParagraphChange?: (index: number) => void;
  onFinished?: () => void;
}

/**
 * Wraps the browser SpeechSynthesis API to narrate a story paragraph by
 * paragraph, so the reader can follow along with a highlighted paragraph,
 * pause/resume, change speed, repeat a paragraph, or jump to any paragraph
 * (used for "sentence/paragraph" navigation and "Listen First" mode).
 */
export function useStoryAudio({
  paragraphs,
  onParagraphChange,
  onFinished,
}: UseStoryAudioOptions) {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const indexRef = useRef<number | null>(null);
  const speedRef = useRef<PlaybackSpeed>(1);
  const stoppedRef = useRef(false);

  const speakIndexRef = useRef<(idx: number) => void>(() => {});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection must run client-side only
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      stoppedRef.current = true;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakIndex = useCallback(
    (idx: number) => {
      if (!isSupported || idx < 0 || idx >= paragraphs.length) {
        setIsPlaying(false);
        setCurrentIndex(null);
        onFinished?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(paragraphs[idx]);
      utter.rate = speedRef.current;
      utter.lang = "en-US";
      utter.onend = () => {
        if (stoppedRef.current) return;
        const next = idx + 1;
        if (next < paragraphs.length) {
          indexRef.current = next;
          setCurrentIndex(next);
          onParagraphChange?.(next);
          speakIndexRef.current(next);
        } else {
          indexRef.current = null;
          setCurrentIndex(null);
          setIsPlaying(false);
          onFinished?.();
        }
      };
      indexRef.current = idx;
      setCurrentIndex(idx);
      onParagraphChange?.(idx);
      setIsPlaying(true);
      setIsPaused(false);
      stoppedRef.current = false;
      window.speechSynthesis.speak(utter);
    },
    [isSupported, paragraphs, onParagraphChange, onFinished]
  );

  useEffect(() => {
    speakIndexRef.current = speakIndex;
  }, [speakIndex]);

  const play = useCallback(
    (fromIndex?: number) => {
      if (!isSupported) return;
      stoppedRef.current = false;
      const start = fromIndex ?? indexRef.current ?? 0;
      speakIndex(start);
    },
    [isSupported, speakIndex]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(null);
    indexRef.current = null;
  }, [isSupported]);

  const repeatParagraph = useCallback(() => {
    const idx = indexRef.current ?? 0;
    speakIndex(idx);
  }, [speakIndex]);

  const changeSpeed = useCallback(
    (s: PlaybackSpeed) => {
      speedRef.current = s;
      setSpeed(s);
      if (isPlaying && !isPaused) {
        const idx = indexRef.current ?? 0;
        speakIndex(idx);
      }
    },
    [isPlaying, isPaused, speakIndex]
  );

  const playSingle = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speedRef.current;
      utter.lang = "en-US";
      utter.onend = () => onEnd?.();
      window.speechSynthesis.speak(utter);
    },
    [isSupported]
  );

  return {
    isSupported,
    isPlaying,
    isPaused,
    speed,
    currentIndex,
    play,
    pause,
    resume,
    stop,
    repeatParagraph,
    changeSpeed,
    playSingle,
  };
}
