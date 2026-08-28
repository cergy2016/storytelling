"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Headphones, Mic } from "lucide-react";
import { allStories, getStoryById } from "@/data/stories";
import { getDailyStory } from "@/lib/daily";
import { CEFR_LEVELS, LEVEL_LABELS, CATEGORIES } from "@/types";
import { LEVEL_BG_CLASS, CATEGORY_ICON } from "@/lib/content-meta";
import { StoryCard } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StoryCover } from "@/components/story-cover";
import { LevelBadge } from "@/components/level-badge";
import { useProgressStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const currentLevel = useProgressStore((s) => s.currentLevel);
  const lastViewedStoryId = useProgressStore((s) => s.lastViewedStoryId);
  const completedIds = useProgressStore((s) => s.completedStoryIds);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  const dailyStory = useMemo(() => getDailyStory(), []);
  const continueStory = mounted && lastViewedStoryId ? getStoryById(lastViewedStoryId) : undefined;

  const recommended = useMemo(() => {
    return allStories
      .filter((s) => s.level === currentLevel && !completedIds.includes(s.id))
      .slice(0, 3);
  }, [currentLevel, completedIds]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={13} /> {allStories.length} stories · A1 to C2
            </span>
            <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Improve Your English <br className="hidden sm:block" /> Through Stories.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
              Read. Listen. Understand. Speak.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/stories">
                <Button size="lg">
                  Start Reading <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/practice/placement-test">
                <Button size="lg" variant="outline">
                  Find My Level
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        {/* Continue Reading */}
        {continueStory && (
          <Section title="Continue Reading" subtitle="Pick up where you left off">
            <div className="max-w-md">
              <StoryCard story={continueStory} />
            </div>
          </Section>
        )}

        {/* Story of the Day */}
        <Section title="Story of the Day" subtitle="A fresh 5-minute learning goal, every day">
          <Card className="grid gap-0 overflow-hidden sm:grid-cols-[1fr_1.4fr]">
            <StoryCover category={dailyStory.category} className="h-48 w-full sm:h-full" iconSize={48} />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <LevelBadge level={dailyStory.level} size="sm" />
              <h3 className="mt-3 font-serif text-2xl font-semibold">{dailyStory.title}</h3>
              <p className="mt-2 text-muted">{dailyStory.description}</p>
              <div className="mt-5">
                <Link href="/daily">
                  <Button>
                    Start today&apos;s challenge <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Section>

        {/* Recommended */}
        {recommended.length > 0 && (
          <Section
            title="Recommended For You"
            subtitle={`Matched to your current level: ${currentLevel}`}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </Section>
        )}

        {/* Browse by level */}
        <Section title="Browse by Level" subtitle="Six clearly separated CEFR levels">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CEFR_LEVELS.map((level) => (
              <Link
                key={level}
                href={`/stories?level=${level}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-md"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white",
                    LEVEL_BG_CLASS[level]
                  )}
                >
                  {level}
                </span>
                <span className="text-sm font-medium">{LEVEL_LABELS[level]}</span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Browse by topic */}
        <Section title="Browse by Topic" subtitle="13 categories, from mystery to science">
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON[cat];
              return (
                <Link
                  key={cat}
                  href={`/stories?category=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-muted"
                >
                  <Icon size={15} className="text-primary" />
                  {cat}
                </Link>
              );
            })}
          </div>
        </Section>

        {/* Value props */}
        <Section title="One learning loop, done right">
          <div className="grid gap-5 sm:grid-cols-3">
            <ValueCard
              icon={<Target size={20} />}
              title="Exactly your level"
              body="Every story is written from scratch for its CEFR level — not just longer or shorter."
            />
            <ValueCard
              icon={<Headphones size={20} />}
              title="Read or listen"
              body="Natural narration with adjustable speed, plus a Listen First mode for real listening practice."
            />
            <ValueCard
              icon={<Mic size={20} />}
              title="Speak, don't just read"
              body="Guided speaking prompts with live feedback on pace, filler words, and fluency."
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ValueCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{body}</p>
    </Card>
  );
}
