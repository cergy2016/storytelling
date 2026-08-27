"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, BookOpen, Layers, RotateCw, ArrowRight, Wand2 } from "lucide-react";
import { getStoryById } from "@/data/stories";
import { useProgressStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/story-card";

export default function PracticePage() {
  const [mounted, setMounted] = useState(false);
  const quizScores = useProgressStore((s) => s.quizScores);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  const weakStories = useMemo(() => {
    if (!mounted) return [];
    return Object.values(quizScores)
      .filter((s) => s.correct / s.total < 0.7)
      .map((s) => getStoryById(s.storyId))
      .filter(Boolean)
      .slice(0, 3);
  }, [quizScores, mounted]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Practice</h1>
      <p className="mt-2 max-w-xl text-muted">
        Sharpen specific skills — find your level, review vocabulary, or revisit
        stories where you struggled.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PracticeCard
          icon={<Sparkles size={20} />}
          title="Placement Test"
          body="Not sure where to start? Take a 5-minute test covering vocabulary, grammar, and reading."
          href="/practice/placement-test"
          cta="Take the test"
        />
        <PracticeCard
          icon={<Layers size={20} />}
          title="Vocabulary Flashcards"
          body="Review every word you've saved with spaced, swipeable flashcards."
          href="/vocabulary"
          cta="Review flashcards"
        />
        <PracticeCard
          icon={<BookOpen size={20} />}
          title="Vocabulary Quiz"
          body="Test yourself on the meanings of words you've collected from stories."
          href="/vocabulary"
          cta="Start quiz"
        />
        <PracticeCard
          icon={<Wand2 size={20} />}
          title="Create My Story"
          body="Generate a brand-new story at your level, focused on the topic and grammar you want to practice."
          href="/create"
          cta="Create a story"
        />
      </div>

      {weakStories.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <RotateCw size={20} className="text-accent" />
            <h2 className="font-serif text-2xl font-semibold">Stories to Revisit</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            Your comprehension score was below 70% on these — a second read can help.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {weakStories.map((s) => s && <StoryCard key={s.id} story={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function PracticeCard({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted">{body}</p>
      <Link href={href} className="mt-4">
        <Button variant="outline" className="w-full">
          {cta} <ArrowRight size={14} />
        </Button>
      </Link>
    </Card>
  );
}
