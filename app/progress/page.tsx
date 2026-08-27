"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Clock,
  Headphones,
  Target,
  Flame,
  Sparkles,
  ArrowRight,
  Award,
} from "lucide-react";
import { getStoryById, allStories } from "@/data/stories";
import { LEVEL_LABELS } from "@/types";
import { useProgressStore } from "@/lib/store";
import { earnedBadges, BADGES } from "@/lib/badges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StoryCard } from "@/components/story-card";
import { LevelBadge } from "@/components/level-badge";
import { formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";

const WEEKLY_GOAL_MINUTES = 60;

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  const progress = useProgressStore();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  const quizAverage = useMemo(() => {
    const scores = Object.values(progress.quizScores);
    if (!scores.length) return 0;
    const total = scores.reduce((acc, s) => acc + s.correct / s.total, 0);
    return Math.round((total / scores.length) * 100);
  }, [progress.quizScores]);

  const recentStories = useMemo(
    () =>
      [...progress.completedStoryIds]
        .reverse()
        .slice(0, 3)
        .map((id) => getStoryById(id))
        .filter(Boolean),
    [progress.completedStoryIds]
  );

  const nextStory = useMemo(
    () => allStories.find((s) => s.level === progress.currentLevel && !progress.completedStoryIds.includes(s.id)),
    [progress.currentLevel, progress.completedStoryIds]
  );

  const earned = mounted ? earnedBadges(progress) : [];
  const earnedIds = new Set(earned.map((b) => b.id));

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Your Progress</h1>
      <p className="mt-2 text-muted">A full picture of how far you&apos;ve come.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={<LevelBadge level={progress.currentLevel} showLabel={false} />} label="Level" value={progress.currentLevel} />
        <Stat icon={<BookOpenCheck size={18} />} label="Stories completed" value={String(progress.completedStoryIds.length)} />
        <Stat icon={<Clock size={18} />} label="Reading time" value={formatMinutes(progress.readingMinutes)} />
        <Stat icon={<Headphones size={18} />} label="Listening time" value={formatMinutes(progress.listeningMinutes)} />
        <Stat icon={<Target size={18} />} label="Quiz average" value={`${quizAverage}%`} />
        <Stat icon={<Flame size={18} />} label="Streak" value={`${progress.streak}d`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Weekly reading goal</h2>
            <span className="text-sm text-muted">
              {Math.min(progress.readingMinutes, WEEKLY_GOAL_MINUTES)} / {WEEKLY_GOAL_MINUTES} min
            </span>
          </div>
          <Progress value={(progress.readingMinutes / WEEKLY_GOAL_MINUTES) * 100} className="h-3" />
          <p className="mt-3 text-sm text-muted">
            {progress.readingMinutes >= WEEKLY_GOAL_MINUTES
              ? "Goal reached — amazing consistency!"
              : `${Math.max(0, WEEKLY_GOAL_MINUTES - Math.round(progress.readingMinutes))} minutes to go this week.`}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <MiniStat label="Words learned" value={String(Object.keys(progress.vocabulary).length)} />
            <MiniStat label="Speaking minutes" value={formatMinutes(progress.speakingMinutes)} />
            <MiniStat label="Longest streak" value={`${progress.longestStreak} days`} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-xl font-semibold">Recommended next</h2>
          {nextStory ? (
            <div className="mt-4">
              <StoryCard story={nextStory} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              You&apos;ve completed every story at this level — try the next CEFR level!
            </p>
          )}
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl font-semibold">Recent Stories</h2>
        {recentStories.length === 0 ? (
          <p className="text-muted">Complete a story to see it here.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentStories.map((s) => s && <StoryCard key={s.id} story={s} />)}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Award size={22} className="text-accent" />
          <h2 className="font-serif text-2xl font-semibold">Achievements</h2>
          <span className="text-sm text-muted">
            {earned.length} / {BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const isEarned = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center",
                  isEarned ? "border-accent/40 bg-accent/5" : "border-border opacity-50"
                )}
              >
                <span className="text-3xl">{b.icon}</span>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-primary/5 p-10 text-center">
        <Sparkles size={26} className="text-primary" />
        <h3 className="font-serif text-xl font-semibold">
          You&apos;re a {LEVEL_LABELS[progress.currentLevel]} learner
        </h3>
        <p className="max-w-md text-sm text-muted">
          Keep your streak alive — read one more story today to grow your vocabulary and confidence.
        </p>
        <Link href="/stories">
          <Button>
            Find a story <ArrowRight size={15} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center gap-1.5 p-4 text-center">
      <div className="text-primary">{icon}</div>
      <p className="font-serif text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
