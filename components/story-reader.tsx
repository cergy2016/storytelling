"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Minus,
  Plus,
  Moon,
  Sun,
  Headphones,
  Volume2Icon,
  Mic2,
} from "lucide-react";
import { Story } from "@/types";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { LevelBadge } from "./level-badge";
import { StoryCover } from "./story-cover";
import { ClickableParagraph } from "./vocabulary-popup";
import { useStoryAudio, type PlaybackSpeed } from "@/hooks/use-story-audio";
import { useProgressStore } from "@/lib/store";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const FONT_SIZES = [1, 1.125, 1.25, 1.5, 1.75];
const SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5];

export function StoryReader({ story }: { story: Story }) {
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [listenFirst, setListenFirst] = useState(false);
  const [hasListenedOnce, setHasListenedOnce] = useState(false);
  const [furthestParagraph, setFurthestParagraph] = useState(0);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const addReadingMinutes = useProgressStore((s) => s.addReadingMinutes);
  const addListeningMinutes = useProgressStore((s) => s.addListeningMinutes);
  const { theme, toggle } = useTheme();
  const listeningStartRef = useRef<number | null>(null);

  const audio = useStoryAudio({
    paragraphs: story.paragraphs,
    onFinished: () => setHasListenedOnce(true),
  });

  // Read the title once before the story text, the first time narration
  // starts for this story (not on every pause/resume).
  const titleReadRef = useRef(false);
  useEffect(() => {
    titleReadRef.current = false;
  }, [story.id]);
  const startListening = (fromIndex: number) => {
    if (!titleReadRef.current) {
      titleReadRef.current = true;
      audio.playSingle(story.title, () => audio.play(fromIndex));
    } else {
      audio.play(fromIndex);
    }
  };

  // Track reading time spent on this story.
  useEffect(() => {
    const start = Date.now();
    return () => {
      const mins = (Date.now() - start) / 60000;
      if (mins > 0.05) addReadingMinutes(mins);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id]);

  // Track listening time based on wall-clock play/pause.
  useEffect(() => {
    if (audio.isPlaying && !audio.isPaused) {
      listeningStartRef.current = Date.now();
    } else if (listeningStartRef.current) {
      const mins = (Date.now() - listeningStartRef.current) / 60000;
      listeningStartRef.current = null;
      if (mins > 0.02) addListeningMinutes(mins);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.isPlaying, audio.isPaused]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            setFurthestParagraph((prev) => Math.max(prev, idx));
          }
        });
      },
      { threshold: 0.4 }
    );
    paragraphRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [story.id]);

  const progressPct = Math.round(
    ((furthestParagraph + 1) / story.paragraphs.length) * 100
  );

  const showText = !listenFirst || hasListenedOnce;

  return (
    <div>
      <StoryCover
        category={story.category}
        storyId={story.id}
        className="h-56 w-full rounded-3xl sm:h-72"
        iconSize={64}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LevelBadge level={story.level} size="lg" />
        <span className="text-sm text-muted">{story.category}</span>
        <span className="text-sm text-muted">·</span>
        <span className="text-sm text-muted">{story.readingTime} min read</span>
        <span className="text-sm text-muted">·</span>
        <span className="text-sm text-muted">{story.wordCount} words</span>
      </div>

      <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        {story.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{story.description}</p>

      <div className="mt-4">
        <Progress value={progressPct} />
        <p className="mt-1.5 text-xs font-medium text-muted">
          Reading progress · {progressPct}%
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-16 z-20 mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface/95 p-3 backdrop-blur">
        {!audio.isSupported ? (
          <span className="text-xs text-muted">Audio narration is not supported in this browser.</span>
        ) : (
          <>
            {!audio.isPlaying ? (
              <Button size="sm" onClick={() => startListening(furthestParagraph)}>
                <Play size={15} /> Listen
              </Button>
            ) : audio.isPaused ? (
              <Button size="sm" onClick={audio.resume}>
                <Play size={15} /> Resume
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={audio.pause}>
                <Pause size={15} /> Pause
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={audio.repeatParagraph} title="Repeat paragraph">
              <RotateCcw size={14} /> Repeat
            </Button>
            <div className="flex items-center overflow-hidden rounded-full border border-border">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => audio.changeSpeed(s)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-semibold",
                    audio.speed === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-surface-muted"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
            {audio.voices.length > 1 && (
              <div className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5">
                <Mic2 size={13} className="shrink-0 text-muted" />
                <select
                  value={audio.voiceURI ?? ""}
                  onChange={(e) => audio.selectVoice(e.target.value)}
                  title="Narration voice"
                  className="max-w-[140px] truncate bg-transparent text-xs font-medium text-muted outline-none sm:max-w-[180px]"
                >
                  {audio.voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-full border border-border">
            <button
              onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
              className="flex h-8 w-8 items-center justify-center text-muted hover:bg-surface-muted"
              aria-label="Decrease font size"
            >
              <Minus size={13} />
            </button>
            <span className="px-1 text-xs font-medium text-muted">Aa</span>
            <button
              onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
              className="flex h-8 w-8 items-center justify-center text-muted hover:bg-surface-muted"
              aria-label="Increase font size"
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:bg-surface-muted"
            aria-label="Toggle reading mode"
            title="Dark / light reading mode"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </div>

      {/* Listen First toggle */}
      <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted">
        <input
          type="checkbox"
          checked={listenFirst}
          onChange={(e) => setListenFirst(e.target.checked)}
          className="accent-primary"
        />
        <Headphones size={13} /> Listen First mode
      </label>

      {/* Story text */}
      <div
        className="reading-content mt-8 max-w-2xl font-serif"
        style={{ "--reading-font-size": `${FONT_SIZES[fontSizeIdx]}rem` } as React.CSSProperties}
      >
        {!showText ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface-muted p-10 text-center">
            <Volume2Icon size={28} className="text-primary" />
            <p className="text-base text-foreground">
              You&apos;re in <strong>Listen First</strong> mode. Listen to the whole
              story before reading the text — great practice for real-life listening.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => startListening(0)}>
                <Play size={15} /> Start listening
              </Button>
              <Button variant="outline" onClick={() => setHasListenedOnce(true)}>
                Read instead
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {story.paragraphs.map((p, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  paragraphRefs.current[idx] = el;
                }}
                data-idx={idx}
                className={cn(
                  "rounded-xl px-2 py-1 transition-colors",
                  audio.currentIndex === idx && "bg-primary/10"
                )}
              >
                <ClickableParagraph text={p} story={story} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
