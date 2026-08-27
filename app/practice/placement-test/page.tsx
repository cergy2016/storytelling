"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { PLACEMENT_QUESTIONS } from "@/data/placement-test";
import { CEFR_LEVELS, CEFRLevel, LEVEL_LABELS } from "@/types";
import { useProgressStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LevelBadge } from "@/components/level-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Stage = "intro" | "testing" | "result";

export default function PlacementTestPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const setPlacementResult = useProgressStore((s) => s.setPlacementResult);

  const question = PLACEMENT_QUESTIONS[index];

  const choose = (opt: string) => {
    setAnswers((a) => ({ ...a, [question.id]: opt }));
  };

  const next = () => {
    if (index + 1 < PLACEMENT_QUESTIONS.length) {
      setIndex((i) => i + 1);
    } else {
      setStage("result");
    }
  };

  const estimated = estimateLevel(answers);

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <Sparkles size={30} className="mx-auto text-primary" />
        <h1 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
          Find Your English Level
        </h1>
        <p className="mt-3 text-muted">
          A short {PLACEMENT_QUESTIONS.length}-question placement test covering
          vocabulary, grammar, and reading comprehension. Takes about 5 minutes.
        </p>
        <Button size="lg" className="mt-6" onClick={() => setStage("testing")}>
          Start the test <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  if (stage === "testing") {
    const selected = answers[question.id];
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Progress value={(index / PLACEMENT_QUESTIONS.length) * 100} className="mb-8" />
        <motion.div key={question.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="outline">{question.skill}</Badge>
          {question.passage && (
            <p className="mt-4 rounded-xl bg-surface-muted p-4 text-sm italic leading-relaxed">
              {question.passage}
            </p>
          )}
          <h2 className="mt-4 font-serif text-xl font-semibold sm:text-2xl">
            {question.prompt}
          </h2>
          <div className="mt-5 space-y-2.5">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-base transition-colors",
                  selected === opt
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-surface-muted"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button className="mt-6" disabled={!selected} onClick={next}>
            {index + 1 < PLACEMENT_QUESTIONS.length ? "Next" : "See my result"}
          </Button>
        </motion.div>
      </div>
    );
  }

  const skillBreakdown = ["Vocabulary", "Grammar", "Reading"] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">Your result</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
        You are approximately <span className="text-primary">{estimated}</span>
      </h1>
      <p className="mt-2 text-muted">{LEVEL_LABELS[estimated]} level</p>

      <div className="mt-8 flex justify-center">
        <LevelBadge level={estimated} size="lg" />
      </div>

      <Card className="mt-8 p-6 text-left">
        <h3 className="mb-3 font-serif text-lg font-semibold">Skill breakdown</h3>
        <div className="space-y-3">
          {skillBreakdown.map((skill) => {
            const qs = PLACEMENT_QUESTIONS.filter((q) => q.skill === skill);
            const correct = qs.filter((q) => answers[q.id] === q.correctAnswer).length;
            return (
              <div key={skill}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{skill}</span>
                  <span className="text-muted">
                    {correct}/{qs.length}
                  </span>
                </div>
                <Progress value={(correct / qs.length) * 100} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          size="lg"
          onClick={() => {
            setPlacementResult(estimated);
          }}
        >
          Set as my level <CheckCircle2 size={16} />
        </Button>
        <Link href={`/stories?level=${estimated}`}>
          <Button size="lg" variant="outline">
            See recommended stories
          </Button>
        </Link>
      </div>
    </div>
  );
}

function estimateLevel(answers: Record<string, string>): CEFRLevel {
  let estimated: CEFRLevel = "A1";
  for (const level of CEFR_LEVELS) {
    const qs = PLACEMENT_QUESTIONS.filter((q) => q.level === level);
    if (!qs.length) continue;
    const correct = qs.filter((q) => answers[q.id] === q.correctAnswer).length;
    const ratio = correct / qs.length;
    if (ratio >= 0.6) {
      estimated = level;
    } else {
      break;
    }
  }
  return estimated;
}
