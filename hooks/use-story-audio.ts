"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEnglishVoices, pickBestVoice, setPreferredVoiceURI, splitIntoSentences } from "@/lib/voice";

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);

  const indexRef = useRef<number | null>(null);
  const speedRef = useRef<PlaybackSpeed>(1);
  const stoppedRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const sentenceQueueRef = useRef<string[]>([]);

  const speakIndexRef = useRef<(idx: number) => void>(() => {});
  const speakSentenceRef = useRef<(paragraphIdx: number, sentenceIdx: number) => void>(
    () => {}
  );

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

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const list = getEnglishVoices();
      if (!list.length) return;
      setVoices(list);
      const best = pickBestVoice(list);
      voiceRef.current = best;
      setVoiceURI(best?.voiceURI ?? null);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const selectVoice = useCallback(
    (uri: string) => {
      const found = voices.find((v) => v.voiceURI === uri) ?? null;
      voiceRef.current = found;
      setVoiceURI(uri);
      setPreferredVoiceURI(uri);
    },
    [voices]
  );

  // Speaking one sentence at a time (rather than a whole paragraph as a
  // single utterance) with a short pause in between reads far more
  // naturally on most synthesizers, which otherwise rush flatly through
  // long text with no phrasing.
  const speakSentence = useCallback(
    (paragraphIdx: number, sentenceIdx: number) => {
      const sentences = sentenceQueueRef.current;
      if (sentenceIdx >= sentences.length) {
        const next = paragraphIdx + 1;
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
        return;
      }
      const utter = new SpeechSynthesisUtterance(sentences[sentenceIdx]);
      utter.rate = speedRef.current;
      utter.lang = "en-US";
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.onend = () => {
        if (stoppedRef.current) return;
        const pauseMs = Math.round(180 / speedRef.current);
        window.setTimeout(() => {
          if (stoppedRef.current) return;
          speakSentenceRef.current(paragraphIdx, sentenceIdx + 1);
        }, pauseMs);
      };
      window.speechSynthesis.speak(utter);
    },
    [paragraphs.length, onParagraphChange, onFinished]
  );

  useEffect(() => {
    speakSentenceRef.current = speakSentence;
  }, [speakSentence]);

  const speakIndex = useCallback(
    (idx: number) => {
      if (!isSupported || idx < 0 || idx >= paragraphs.length) {
        setIsPlaying(false);
        setCurrentIndex(null);
        onFinished?.();
        return;
      }
      window.speechSynthesis.cancel();
      sentenceQueueRef.current = splitIntoSentences(paragraphs[idx]);
      indexRef.current = idx;
      setCurrentIndex(idx);
      onParagraphChange?.(idx);
      setIsPlaying(true);
      setIsPaused(false);
      stoppedRef.current = false;
      speakSentenceRef.current(idx, 0);
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
      if (voiceRef.current) utter.voice = voiceRef.current;
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
    voices,
    voiceURI,
    selectVoice,
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
