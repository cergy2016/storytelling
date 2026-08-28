"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, Circle, Sparkles, ArrowRight } from "lucide-react";
import { getDailyStory } from "@/lib/daily";
import { useProgressStore } from "@/lib/store";
import { todayISO } from "@/lib/utils";
import { StoryCover } from "@/components/story-cover";
import { LevelBadge } from "@/components/level-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DailyStoryPage() {
  const [mounted, setMounted] = useState(false);
  const dailyStory = useMemo(() => getDailyStory(), []);
  const progress = useProgressStore();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const today = todayISO();
  const alreadyClaimed = progress.dailyStoryDate === today && progress.dailyStoryCompleted;

  const quizDone = !!progress.quizScores[dailyStory.id];
  const opened = progress.lastViewedStoryId === dailyStory.id;
  const vocabDone = dailyStory.vocabulary.some(
    (v) => !!progress.vocabulary[v.word.toLowerCase()]
  );
  const speakDone = progress.speakingMinutes > 0;

  const steps = [
    { label: "Read the story (5-minute goal)", done: opened || quizDone },
    { label: "Complete the comprehension quiz", done: quizDone },
    { label: "Save at least one vocabulary word", done: vocabDone },
    { label: "Try a speaking prompt", done: speakDone },
  ];
  const canClaim = quizDone && !alreadyClaimed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2 text-primary">
        <CalendarDays size={20} />
        <span className="text-sm font-semibold uppercase tracking-wide">
          Story of the Day · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>

      <Card className="mt-6 overflow-hidden">
        <StoryCover category={dailyStory.category} storyId={dailyStory.id} className="h-56 w-full" iconSize={56} />
        <div className="p-6">
          <LevelBadge level={dailyStory.level} />
          <h1 className="mt-3 font-serif text-3xl font-semibold">{dailyStory.title}</h1>
          <p className="mt-2 text-muted">{dailyStory.description}</p>
          <Link href={`/stories/${dailyStory.id}`}>
            <Button size="lg" className="mt-5">
              Open today&apos;s story <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-serif text-xl font-semibold">Today&apos;s challenge checklist</h2>
        <div className="mt-4 space-y-3">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              {step.done ? (
                <Check size={18} className="shrink-0 rounded-full bg-emerald-500 p-0.5 text-white" />
              ) : (
                <Circle size={18} className="shrink-0 text-border" />
              )}
              <span className={cn("text-sm", step.done && "text-muted line-through")}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <span className="text-sm font-medium">
              {alreadyClaimed ? "Reward claimed for today!" : "Complete the quiz to unlock +15 XP"}
            </span>
          </div>
          <Button
            disabled={!canClaim}
            onClick={() => progress.completeDailyStory()}
            variant={alreadyClaimed ? "subtle" : "accent"}
          >
            {alreadyClaimed ? "Come back tomorrow" : "Claim reward"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
