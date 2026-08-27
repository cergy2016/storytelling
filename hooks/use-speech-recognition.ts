"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FILLER_WORDS = ["um", "uh", "erm", "like", "you know", "so", "actually", "basically"];

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtorType = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtorType | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtorType;
    webkitSpeechRecognition?: SpeechRecognitionCtorType;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeakingFeedback {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillerRatio: number;
  avgConfidence: number | null;
  fluencyScore: number; // 0-100 heuristic
  clarityLabel: "Excellent" | "Good" | "Fair" | "Needs practice";
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startTimeRef = useRef<number>(0);
  const confidencesRef = useRef<number[]>([]);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection must run client-side only
    setIsSupported(!!getSpeechRecognitionCtor());
  }, []);

  const computeFeedback = useCallback((): SpeakingFeedback => {
    const durationSeconds = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
    const text = finalTranscriptRef.current.trim();
    const words = text.length ? text.split(/\s+/) : [];
    const wordCount = words.length;
    const lowerText = text.toLowerCase();
    const fillerCount = FILLER_WORDS.reduce((acc, f) => {
      const re = new RegExp(`\\b${f}\\b`, "g");
      return acc + (lowerText.match(re)?.length ?? 0);
    }, 0);
    const wordsPerMinute = Math.round((wordCount / durationSeconds) * 60);
    const fillerRatio = wordCount ? fillerCount / wordCount : 0;
    const avgConfidence = confidencesRef.current.length
      ? confidencesRef.current.reduce((a, b) => a + b, 0) / confidencesRef.current.length
      : null;

    let fluencyScore = 100;
    if (wordsPerMinute < 60) fluencyScore -= 25;
    else if (wordsPerMinute > 170) fluencyScore -= 15;
    fluencyScore -= Math.min(40, fillerRatio * 300);
    if (avgConfidence !== null) fluencyScore = fluencyScore * 0.7 + avgConfidence * 100 * 0.3;
    fluencyScore = Math.max(0, Math.min(100, Math.round(fluencyScore)));

    const clarityLabel: SpeakingFeedback["clarityLabel"] =
      fluencyScore >= 85 ? "Excellent" : fluencyScore >= 65 ? "Good" : fluencyScore >= 40 ? "Fair" : "Needs practice";

    return {
      durationSeconds,
      wordCount,
      wordsPerMinute: Number.isFinite(wordsPerMinute) ? wordsPerMinute : 0,
      fillerCount,
      fillerRatio,
      avgConfidence,
      fluencyScore,
      clarityLabel,
    };
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    finalTranscriptRef.current = "";
    confidencesRef.current = [];
    startTimeRef.current = Date.now();
    setTranscript("");
    setFeedback(null);

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscriptRef.current += text + " ";
          if (typeof result[0].confidence === "number" && result[0].confidence > 0) {
            confidencesRef.current.push(result[0].confidence);
          }
        } else {
          interim += text;
        }
      }
      setTranscript((finalTranscriptRef.current + interim).trim());
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setFeedback(computeFeedback());
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [computeFeedback]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, isRecording, transcript, feedback, start, stop };
}
