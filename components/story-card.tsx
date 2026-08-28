"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Headphones, CheckCircle2, BarChart3, BookText } from "lucide-react";
import { Story } from "@/types";
import { StoryCover } from "./story-cover";
import { LevelBadge } from "./level-badge";
import { useProgressStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Easy-Medium",
  3: "Medium",
  4: "Challenging",
  5: "Advanced",
};

export function StoryCard({ story }: { story: Story }) {
  const [mounted, setMounted] = useState(false);
  const completed = useProgressStore((s) => s.completedStoryIds.includes(story.id));
  const score = useProgressStore((s) => s.quizScores[story.id]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href={`/stories/${story.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative">
        <StoryCover category={story.category} storyId={story.id} className="h-36 w-full" />
        <div className="absolute left-3 top-3">
          <LevelBadge level={story.level} size="sm" showLabel={false} />
        </div>
        {mounted && completed && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow">
            <CheckCircle2 size={12} /> Done
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {story.category}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
          {story.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">{story.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {story.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 size={12} /> {DIFFICULTY_LABEL[story.difficulty]}
          </span>
          <span className="flex items-center gap-1">
            <BookText size={12} /> {story.vocabulary.length} words
          </span>
          {story.audioAvailable && (
            <span className="flex items-center gap-1">
              <Headphones size={12} /> Audio
            </span>
          )}
        </div>

        {mounted && score && (
          <p
            className={cn(
              "mt-2 text-xs font-semibold",
              score.correct / score.total >= 0.7 ? "text-emerald-600" : "text-accent"
            )}
          >
            Last score: {score.correct}/{score.total}
          </p>
        )}
      </div>
    </Link>
  );
}
