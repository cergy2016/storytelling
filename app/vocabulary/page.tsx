"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Volume2,
  ThumbsUp,
  Clock,
  Trash2,
  Layers,
  ListChecks,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";
import { CEFRLevel, SavedVocabEntry, VocabStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/level-badge";
import { useProgressStore } from "@/lib/store";
import { speakText as speak } from "@/lib/voice";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | VocabStatus;
type ViewMode = "list" | "cards" | "quiz";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function VocabularyPage() {
  const [mounted, setMounted] = useState(false);
  const vocabulary = useProgressStore((s) => s.vocabulary);
  const setVocabStatus = useProgressStore((s) => s.setVocabStatus);
  const removeVocabWord = useProgressStore((s) => s.removeVocabWord);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [levelFilter, setLevelFilter] = useState<CEFRLevel | "all">("all");
  const [view, setView] = useState<ViewMode>("list");
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  const entries = useMemo(() => Object.values(vocabulary), [vocabulary]);
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (levelFilter !== "all" && e.level !== levelFilter) return false;
      return true;
    });
  }, [entries, statusFilter, levelFilter]);

  if (!mounted) return null;

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <BookOpen size={36} className="mx-auto text-primary" />
        <h1 className="mt-4 font-serif text-3xl font-semibold">Your Vocabulary</h1>
        <p className="mt-2 text-muted">
          You haven&apos;t saved any words yet. While reading a story, click any
          highlighted word and tap &ldquo;Add to vocabulary.&rdquo;
        </p>
        <Link href="/stories">
          <Button className="mt-6">Browse stories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Your Vocabulary</h1>
          <p className="mt-1 text-muted">{entries.length} words saved from your stories</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border">
          {(["list", "cards", "quiz"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                setCardIdx(0);
                setFlipped(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold capitalize",
                view === v ? "bg-primary text-primary-foreground" : "text-muted"
              )}
            >
              {v === "list" && <ListChecks size={13} />}
              {v === "cards" && <Layers size={13} />}
              {v === "quiz" && <ListChecks size={13} />}
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "new", "review", "known"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
              statusFilter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
            )}
          >
            {s}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as CEFRLevel | "all")}
          className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold"
        >
          <option value="all">All levels</option>
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">No words match this filter.</p>
      ) : view === "list" ? (
        <div className="space-y-3">
          {filtered.map((e) => (
            <VocabRow
              key={e.word}
              entry={e}
              onStatus={(s) => setVocabStatus(e.word, s)}
              onRemove={() => removeVocabWord(e.word)}
            />
          ))}
        </div>
      ) : view === "cards" ? (
        <FlashcardMode
          entries={filtered}
          idx={cardIdx}
          flipped={flipped}
          setFlipped={setFlipped}
          onMark={(status) => {
            setVocabStatus(filtered[cardIdx].word, status);
            setFlipped(false);
            setCardIdx((i) => (i + 1) % filtered.length);
          }}
        />
      ) : (
        <VocabQuiz entries={filtered} />
      )}
    </div>
  );
}

function VocabRow({
  entry,
  onStatus,
  onRemove,
}: {
  entry: SavedVocabEntry;
  onStatus: (s: VocabStatus) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      <button
        onClick={() => speak(entry.word)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <Volume2 size={16} />
      </button>
      <div className="min-w-[140px] flex-1">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-semibold capitalize">{entry.word}</span>
          <LevelBadge level={entry.level} size="sm" showLabel={false} />
        </div>
        <p className="text-sm text-muted">{entry.entry.definition}</p>
        <p className="mt-0.5 text-xs text-muted">from &ldquo;{entry.storyTitle}&rdquo;</p>
      </div>
      <Badge
        variant={entry.status === "known" ? "success" : entry.status === "review" ? "accent" : "default"}
        className="capitalize"
      >
        {entry.status}
      </Badge>
      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" onClick={() => onStatus("review")}>
          <Clock size={13} />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onStatus("known")}>
          <ThumbsUp size={13} />
        </Button>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 size={13} className="text-red-500" />
        </Button>
      </div>
    </Card>
  );
}

function FlashcardMode({
  entries,
  idx,
  flipped,
  setFlipped,
  onMark,
}: {
  entries: SavedVocabEntry[];
  idx: number;
  flipped: boolean;
  setFlipped: (f: boolean) => void;
  onMark: (s: VocabStatus) => void;
}) {
  const entry = entries[idx % entries.length];
  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center text-xs font-semibold text-muted">
        Card {(idx % entries.length) + 1} of {entries.length}
      </p>
      <button
        onClick={() => setFlipped(!flipped)}
        className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface p-8 text-center shadow-sm"
      >
        {!flipped ? (
          <>
            <span className="font-serif text-3xl font-semibold capitalize">{entry.word}</span>
            <span className="text-sm text-muted">
              {entry.entry.partOfSpeech} · {entry.entry.pronunciation}
            </span>
          </>
        ) : (
          <>
            <p className="text-base leading-relaxed">{entry.entry.definition}</p>
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm italic text-muted">
              “{entry.entry.example}”
            </p>
          </>
        )}
      </button>
      <div className="mt-4 flex justify-center gap-3">
        <Button variant="outline" onClick={() => onMark("review")}>
          <Clock size={15} /> Review later
        </Button>
        <Button onClick={() => onMark("known")}>
          <ThumbsUp size={15} /> I know this
        </Button>
      </div>
    </div>
  );
}

function VocabQuiz({ entries }: { entries: SavedVocabEntry[] }) {
  const questions = useMemo(() => {
    if (entries.length < 4) return [];
    return shuffle(entries)
      .slice(0, Math.min(8, entries.length))
      .map((e) => {
        const distractors = shuffle(entries.filter((x) => x.word !== e.word))
          .slice(0, 3)
          .map((x) => x.entry.definition);
        return {
          word: e.word,
          correctDef: e.entry.definition,
          options: shuffle([e.entry.definition, ...distractors]),
        };
      });
  }, [entries]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (entries.length < 4) {
    return <p className="text-muted">Save at least 4 words to unlock the vocabulary quiz.</p>;
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="font-serif text-4xl font-bold text-primary">
          {score} / {questions.length}
        </p>
        <p className="mt-2 text-muted">Nice review session.</p>
      </div>
    );
  }

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
    } else setDone(true);
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-center text-xs font-semibold text-muted">
        {idx + 1} / {questions.length}
      </p>
      <p className="mb-4 text-center font-serif text-2xl font-semibold capitalize">{q.word}</p>
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
