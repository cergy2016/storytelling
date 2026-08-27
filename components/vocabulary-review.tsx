"use client";

import { useMemo, useState } from "react";
import { Volume2, ThumbsUp, Clock, Layers, ListChecks, CheckCircle2, XCircle } from "lucide-react";
import { Story, VocabularyWord } from "@/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useProgressStore } from "@/lib/store";
import { speakText as speak } from "@/lib/voice";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function Flashcards({ words, story }: { words: VocabularyWord[]; story: Story }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const addVocabWord = useProgressStore((s) => s.addVocabWord);
  const setVocabStatus = useProgressStore((s) => s.setVocabStatus);
  const word = words[idx];

  const advance = () => {
    setFlipped(false);
    setIdx((i) => (i + 1) % words.length);
  };

  const mark = (status: "known" | "review") => {
    addVocabWord(story, word.word);
    setVocabStatus(word.word, status);
    advance();
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center text-xs font-semibold text-muted">
        Card {idx + 1} of {words.length}
      </p>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface p-8 text-center shadow-sm transition-transform active:scale-[0.99]"
      >
        {!flipped ? (
          <>
            <span className="font-serif text-3xl font-semibold capitalize">{word.word}</span>
            <span className="text-sm text-muted">
              {word.partOfSpeech} · {word.pronunciation}
            </span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                speak(word.word);
              }}
              className="mt-2 rounded-full bg-primary/10 p-2 text-primary"
            >
              <Volume2 size={16} />
            </span>
            <span className="mt-2 text-xs text-muted">Tap to reveal meaning</span>
          </>
        ) : (
          <>
            <p className="text-base leading-relaxed">{word.definition}</p>
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm italic text-muted">
              “{word.example}”
            </p>
          </>
        )}
      </button>

      <div className="mt-4 flex justify-center gap-3">
        <Button variant="outline" onClick={() => mark("review")}>
          <Clock size={15} /> Review later
        </Button>
        <Button onClick={() => mark("known")}>
          <ThumbsUp size={15} /> I know this
        </Button>
      </div>
    </div>
  );
}

interface MiniQuizQ {
  word: string;
  correctDef: string;
  options: string[];
}

function MiniQuiz({ words }: { words: VocabularyWord[] }) {
  const questions = useMemo<MiniQuizQ[]>(() => {
    return shuffle(words)
      .slice(0, Math.min(6, words.length))
      .map((w) => {
        const distractors = shuffle(words.filter((x) => x.word !== w.word))
          .slice(0, 3)
          .map((x) => x.definition);
        return {
          word: w.word,
          correctDef: w.definition,
          options: shuffle([w.definition, ...distractors]),
        };
      });
  }, [words]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  const choose = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.correctDef) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-serif text-3xl font-bold text-primary">
          {score} / {questions.length}
        </p>
        <p className="mt-2 text-muted">Vocabulary quiz complete.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center text-xs font-semibold text-muted">
        {idx + 1} / {questions.length}
      </p>
      <p className="mb-4 text-center font-serif text-2xl font-semibold capitalize">
        {q.word}
      </p>
      <div className="space-y-2">
        {q.options.map((opt) => {
          const isCorrect = selected && opt === q.correctDef;
          const isWrong = selected && opt === selected && opt !== q.correctDef;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm",
                !selected && "border-border hover:bg-surface-muted",
                isCorrect && "border-emerald-500 bg-emerald-500/10",
                isWrong && "border-red-400 bg-red-500/10",
                selected && !isCorrect && !isWrong && "opacity-60"
              )}
            >
              {opt}
              {isCorrect && <CheckCircle2 size={16} className="text-emerald-600" />}
              {isWrong && <XCircle size={16} className="text-red-500" />}
            </button>
          );
        })}
      </div>
      {selected && (
        <Button className="mt-4 w-full" onClick={next}>
          {idx + 1 < questions.length ? "Next word" : "Finish"}
        </Button>
      )}
    </div>
  );
}

export function VocabularyReview({ story }: { story: Story }) {
  const [mode, setMode] = useState<"cards" | "quiz">("cards");
  const words = story.vocabulary;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Vocabulary Review</h2>
          <p className="text-sm text-muted">{words.length} key words from this story</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border">
          <button
            onClick={() => setMode("cards")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold",
              mode === "cards" ? "bg-primary text-primary-foreground" : "text-muted"
            )}
          >
            <Layers size={13} /> Flashcards
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold",
              mode === "quiz" ? "bg-primary text-primary-foreground" : "text-muted"
            )}
          >
            <ListChecks size={13} /> Quick quiz
          </button>
        </div>
      </div>

      <div className="mt-6">
        {mode === "cards" ? (
          <Flashcards words={words} story={story} />
        ) : (
          <MiniQuiz words={words} />
        )}
      </div>
    </Card>
  );
}
