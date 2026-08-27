"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CEFR_LEVELS, LEVEL_LABELS, LEVEL_WORD_RANGE } from "@/types";
import { getStoriesByLevel } from "@/data/stories";
import { LEVEL_BG_CLASS } from "@/lib/content-meta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "Very common vocabulary, short sentences, present and past simple.",
  A2: "More descriptive language, basic connectors, past and future forms.",
  B1: "Natural dialogue, wider vocabulary, a real mix of tenses.",
  B2: "Complex sentences, phrasal verbs, and idiomatic expressions.",
  C1: "Sophisticated vocabulary, nuance, figurative language.",
  C2: "Subtle meaning, irony, implicit information, advanced syntax.",
};

export default function LevelsPage() {
  const [mounted, setMounted] = useState(false);
  const currentLevel = useProgressStore((s) => s.currentLevel);
  const completedIds = useProgressStore((s) => s.completedStoryIds);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);
  const currentIdx = CEFR_LEVELS.indexOf(currentLevel);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Your Reading Journey</h1>
      <p className="mt-2 max-w-xl text-muted">
        Six clearly separated CEFR levels, each with genuinely different vocabulary,
        grammar, and cognitive complexity — not just longer stories.
      </p>

      {/* Progress track */}
      <div className="mt-10 flex items-center">
        {CEFR_LEVELS.map((level, i) => {
          const isDone = mounted && i < currentIdx;
          const isCurrent = mounted && i === currentIdx;
          return (
            <div key={level} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    isDone && `${LEVEL_BG_CLASS[level]} border-transparent text-white`,
                    isCurrent && "scale-110 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                    !isDone && !isCurrent && "border-border text-muted"
                  )}
                >
                  {isDone ? <Check size={18} /> : level}
                </div>
                <span className="text-xs font-medium text-muted">{level}</span>
              </div>
              {i < CEFR_LEVELS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full",
                    i < currentIdx ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CEFR_LEVELS.map((level) => {
          const stories = getStoriesByLevel(level);
          const doneCount = stories.filter((s) => completedIds.includes(s.id)).length;
          return (
            <Card key={level} className="flex flex-col p-6">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white",
                    LEVEL_BG_CLASS[level]
                  )}
                >
                  {level}
                </span>
                <div>
                  <p className="font-serif text-lg font-semibold">{LEVEL_LABELS[level]}</p>
                  <p className="text-xs text-muted">{LEVEL_WORD_RANGE[level]}</p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm text-muted">{LEVEL_DESCRIPTIONS[level]}</p>
              <p className="mt-4 text-xs font-semibold text-muted">
                {mounted ? `${doneCount} / ${stories.length} completed` : `${stories.length} stories`}
              </p>
              <Link href={`/stories?level=${level}`} className="mt-4">
                <Button variant="outline" className="w-full">
                  Explore {level} stories <ArrowRight size={14} />
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
