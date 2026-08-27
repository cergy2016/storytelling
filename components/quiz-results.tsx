"use client";

import Link from "next/link";
import { Trophy, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Story } from "@/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { StoryCover } from "./story-cover";
import { LevelBadge } from "./level-badge";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
  story: Story;
  correct: number;
  total: number;
  answers: { questionId: string; userAnswer: string | string[]; correct: boolean }[];
  nextStory?: Story;
}

function feedbackFor(pct: number) {
  if (pct >= 90)
    return {
      title: "Outstanding comprehension!",
      body: "You understood the story deeply — you're ready for more challenging material.",
    };
  if (pct >= 70)
    return {
      title: "Great work!",
      body: "You grasped the key ideas well. Review the words below to sharpen the details.",
    };
  if (pct >= 50)
    return {
      title: "Good effort.",
      body: "You're building real comprehension. Re-reading the highlighted parts will help.",
    };
  return {
    title: "Keep practicing.",
    body: "This one was challenging — that's normal. Try listening again before the next story.",
  };
}

export function QuizResults({ story, correct, total, answers, nextStory }: QuizResultsProps) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const fb = feedbackFor(pct);
  const wrongQuestions = answers.filter((a) => !a.correct);

  let recommendedLevel = story.level;
  if (pct < 50) {
    const order: Story["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const idx = order.indexOf(story.level);
    if (idx > 0) recommendedLevel = order[idx - 1];
  }

  return (
    <div>
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-3 bg-primary/5 p-8 text-center">
          <Trophy size={32} className="text-accent" />
          <h2 className="font-serif text-2xl font-semibold">Comprehension Score</h2>
          <p className="font-serif text-5xl font-bold text-primary">
            {correct} / {total}
          </p>
          <p className="text-lg font-semibold">{pct}%</p>
          <p className="max-w-md text-sm text-muted">{fb.body}</p>
          <p className="font-medium text-foreground">{fb.title}</p>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="border-t border-border p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Review your answers
            </h3>
            <div className="space-y-3">
              {answers.map((a, i) => (
                <div
                  key={a.questionId}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    a.correct ? "bg-emerald-500/5" : "bg-red-500/5"
                  )}
                >
                  {a.correct ? (
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle size={15} className="shrink-0 text-red-500" />
                  )}
                  <span>Question {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-serif text-lg font-semibold">Recommended level</h3>
          <div className="mt-3 flex items-center gap-2">
            <LevelBadge level={recommendedLevel} size="lg" />
          </div>
          <p className="mt-2 text-sm text-muted">
            {recommendedLevel === story.level
              ? "You're well matched to this level — keep going!"
              : `Consider reviewing a few ${recommendedLevel} stories to strengthen your foundation.`}
          </p>
        </Card>

        {nextStory && (
          <Card className="flex items-center gap-4 p-5">
            <StoryCover category={nextStory.category} className="h-16 w-16 shrink-0 rounded-xl" iconSize={22} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Next story</p>
              <p className="truncate font-serif font-semibold">{nextStory.title}</p>
              <Link href={`/stories/${nextStory.id}`}>
                <Button size="sm" className="mt-2">
                  Continue reading <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
