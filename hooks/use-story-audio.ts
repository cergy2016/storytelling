"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEnglishVoices, pickBestVoice, setPreferredVoiceURI, splitIntoSentences } from "@/lib/voice";
import {
  checkVoiceboxHealth,
  getVoiceboxProfiles,
  getStoredVoiceboxProfile,
  setStoredVoiceboxProfile,
  voiceboxGenerate,
  isMixedContentBlocked,
  type VoiceboxProfile,
} from "@/lib/voicebox";

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;
export type NarrationEngine = "browser" | "voicebox";

interface UseStoryAudioOptions {
  paragraphs: string[];
  onParagraphChange?: (index: number) => void;
  onFinished?: () => void;
}

/**
 * Narrates a story paragraph by paragraph (sentence by sentence within each,
 * with a short pause between sentences for natural phrasing). Prefers a
 * locally-running Voicebox server when reachable (much more natural voices),
 * and transparently falls back to the browser's built-in SpeechSynthesis —
 * per-sentence, so a single failed Voicebox call never stalls playback.
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

  const [engine, setEngineState] = useState<NarrationEngine>("browser");
  const [voiceboxAvailable, setVoiceboxAvailable] = useState(false);
  const [voiceboxProfiles, setVoiceboxProfiles] = useState<VoiceboxProfile[]>([]);
  const [voiceboxProfileId, setVoiceboxProfileIdState] = useState<string | null>(null);
  const [voiceboxBlockedByMixedContent, setVoiceboxBlockedByMixedContent] = useState(false);

  const indexRef = useRef<number | null>(null);
  const speedRef = useRef<PlaybackSpeed>(1);
  const stoppedRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const sentenceQueueRef = useRef<string[]>([]);
  const engineRef = useRef<NarrationEngine>("browser");
  const voiceboxProfileRef = useRef<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

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
      audioElRef.current?.pause();
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

  // Detect a locally-running Voicebox server and prefer it automatically
  // when reachable, since it sounds far more natural than browser voices.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-side detection
    setVoiceboxBlockedByMixedContent(isMixedContentBlocked());
    let cancelled = false;
    checkVoiceboxHealth().then(async (ok) => {
      if (cancelled || !ok) return;
      setVoiceboxAvailable(true);
      setEngineState("voicebox");
      engineRef.current = "voicebox";
      const profiles = await getVoiceboxProfiles();
      if (cancelled) return;
      setVoiceboxProfiles(profiles);
      if (profiles.length) {
        const stored = getStoredVoiceboxProfile();
        const initial = profiles.find((p) => p.id === stored)?.id ?? profiles[0].id;
        voiceboxProfileRef.current = initial;
        setVoiceboxProfileIdState(initial);
      }
    });
    return () => {
      cancelled = true;
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

  const setEngine = useCallback((e: NarrationEngine) => {
    engineRef.current = e;
    setEngineState(e);
  }, []);

  const selectVoiceboxProfile = useCallback((id: string) => {
    voiceboxProfileRef.current = id;
    setVoiceboxProfileIdState(id);
    setStoredVoiceboxProfile(id);
  }, []);

  const speakBrowserSentence = useCallback((text: string, onEnd: () => void) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speedRef.current;
    utter.lang = "en-US";
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.onend = () => onEnd();
    utter.onerror = () => onEnd();
    window.speechSynthesis.speak(utter);
  }, []);

  // Speaking one sentence at a time (rather than a whole paragraph as a
  // single utterance) with a short pause in between reads far more
  // naturally, whichever engine is doing the speaking.
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

      const advance = () => {
        if (stoppedRef.current) return;
        const pauseMs = Math.round(180 / speedRef.current);
        window.setTimeout(() => {
          if (stoppedRef.current) return;
          speakSentenceRef.current(paragraphIdx, sentenceIdx + 1);
        }, pauseMs);
      };

      if (engineRef.current === "voicebox") {
        voiceboxGenerate(sentences[sentenceIdx], voiceboxProfileRef.current)
          .then((url) => {
            if (stoppedRef.current) return;
            if (!url) {
              // Voicebox failed for this sentence — don't stall, just read
              // it with the browser voice instead and continue the queue.
              speakBrowserSentence(sentences[sentenceIdx], advance);
              return;
            }
            const audioEl = new Audio(url);
            audioEl.playbackRate = speedRef.current;
            audioEl.onended = advance;
            audioEl.onerror = () => speakBrowserSentence(sentences[sentenceIdx], advance);
            audioElRef.current = audioEl;
            audioEl.play().catch(() => speakBrowserSentence(sentences[sentenceIdx], advance));
          })
          .catch(() => {
            if (!stoppedRef.current) speakBrowserSentence(sentences[sentenceIdx], advance);
          });
      } else {
        speakBrowserSentence(sentences[sentenceIdx], advance);
      }
    },
    [paragraphs.length, onParagraphChange, onFinished, speakBrowserSentence]
  );

  useEffect(() => {
    speakSentenceRef.current = speakSentence;
  }, [speakSentence]);

  const speakIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= paragraphs.length) {
        setIsPlaying(false);
        setCurrentIndex(null);
        onFinished?.();
        return;
      }
      window.speechSynthesis.cancel();
      audioElRef.current?.pause();
      sentenceQueueRef.current = splitIntoSentences(paragraphs[idx]);
      indexRef.current = idx;
      setCurrentIndex(idx);
      onParagraphChange?.(idx);
      setIsPlaying(true);
      setIsPaused(false);
      stoppedRef.current = false;
      speakSentenceRef.current(idx, 0);
    },
    [paragraphs, onParagraphChange, onFinished]
  );

  useEffect(() => {
    speakIndexRef.current = speakIndex;
  }, [speakIndex]);

  const play = useCallback(
    (fromIndex?: number) => {
      stoppedRef.current = false;
      const start = fromIndex ?? indexRef.current ?? 0;
      speakIndex(start);
    },
    [speakIndex]
  );

  const pause = useCallback(() => {
    if (engineRef.current === "voicebox" && audioElRef.current) {
      audioElRef.current.pause();
    } else {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (engineRef.current === "voicebox" && audioElRef.current) {
      audioElRef.current.play().catch(() => {});
    } else {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    if (audioElRef.current) {
      audioElRef.current.onended = null;
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(null);
    indexRef.current = null;
  }, []);

  const repeatParagraph = useCallback(() => {
    const idx = indexRef.current ?? 0;
    speakIndex(idx);
  }, [speakIndex]);

  const changeSpeed = useCallback(
    (s: PlaybackSpeed) => {
      speedRef.current = s;
      setSpeed(s);
      // A Voicebox <audio> element can just have its rate adjusted live,
      // no need to regenerate/restart the sentence.
      if (engineRef.current === "voicebox" && audioElRef.current) {
        audioElRef.current.playbackRate = s;
        return;
      }
      if (isPlaying && !isPaused) {
        const idx = indexRef.current ?? 0;
        speakIndex(idx);
      }
    },
    [isPlaying, isPaused, speakIndex]
  );

  const playSingle = useCallback((text: string, onEnd?: () => void) => {
    if (engineRef.current === "voicebox") {
      voiceboxGenerate(text, voiceboxProfileRef.current).then((url) => {
        if (!url) {
          speakBrowserSentence(text, () => onEnd?.());
          return;
        }
        const audioEl = new Audio(url);
        audioEl.playbackRate = speedRef.current;
        audioEl.onended = () => onEnd?.();
        audioEl.onerror = () => speakBrowserSentence(text, () => onEnd?.());
        audioEl.play().catch(() => speakBrowserSentence(text, () => onEnd?.()));
      });
      return;
    }
    speakBrowserSentence(text, () => onEnd?.());
  }, [speakBrowserSentence]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    speed,
    voices,
    voiceURI,
    selectVoice,
    engine,
    setEngine,
    voiceboxAvailable,
    voiceboxProfiles,
    voiceboxProfileId,
    voiceboxBlockedByMixedContent,
    selectVoiceboxProfile,
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
