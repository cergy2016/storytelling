"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Quote, RotateCcw } from "lucide-react";
import { Question } from "@/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<Question["type"], string> = {
  "multiple-choice": "Multiple choice",
  "true-false": "True or false",
  meaning: "Choose the meaning",
  "fill-blank": "Fill in the blank",
  ordering: "Put in order",
  "who-said-it": "Who said it?",
  "vocab-in-context": "Vocabulary in context",
  "main-idea": "Main idea",
  detail: "Detail question",
  inference: "Inference",
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?;:]$/g, "");
}

export function QuizQuestion({
  question,
  index,
  total,
  onAnswered,
}: {
  question: Question;
  index: number;
  total: number;
  onAnswered: (userAnswer: string | string[], correct: boolean) => void;
}) {
  const isOrdering = question.type === "ordering";
  const isFillBlank = question.type === "fill-blank";

  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const options = useMemo(
    () => question.options ?? (question.type === "true-false" ? ["True", "False"] : []),
    [question]
  );
  const remainingOrderOptions = options.filter((o) => !order.includes(o));

  const computeCorrect = (): { correct: boolean; userAnswer: string | string[] } => {
    if (isOrdering) {
      const correctArr = question.correctAnswer as string[];
      const correct =
        order.length === correctArr.length &&
        order.every((v, i) => v === correctArr[i]);
      return { correct, userAnswer: order };
    }
    if (isFillBlank) {
      const correct = normalize(textAnswer) === normalize(question.correctAnswer as string);
      return { correct, userAnswer: textAnswer };
    }
    const correct =
      selected !== null &&
      normalize(selected) === normalize(question.correctAnswer as string);
    return { correct, userAnswer: selected ?? "" };
  };

  const [result, setResult] = useState<{ correct: boolean; userAnswer: string | string[] } | null>(
    null
  );

  const canCheck = isOrdering
    ? order.length === options.length
    : isFillBlank
      ? textAnswer.trim().length > 0
      : !!selected;

  const handleCheck = () => {
    const r = computeCorrect();
    setResult(r);
    setChecked(true);
    onAnswered(r.userAnswer, r.correct);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Badge variant="outline">{TYPE_LABELS[question.type]}</Badge>
        <span className="text-xs font-medium text-muted">
          Question {index + 1} of {total}
        </span>
      </div>

      <h3 className="mt-3 font-serif text-xl font-semibold leading-snug sm:text-2xl">
        {question.prompt}
      </h3>

      {isFillBlank ? (
        <input
          disabled={checked}
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your answer…"
          className="mt-5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary disabled:opacity-70"
        />
      ) : isOrdering ? (
        <div className="mt-5 space-y-3">
          <div className="min-h-14 rounded-xl border border-dashed border-border bg-surface-muted p-2">
            {order.length === 0 && (
              <p className="p-2 text-sm text-muted">Click the events below in the correct order.</p>
            )}
            <ol className="space-y-1.5">
              {order.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm shadow-sm"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {item}
                  {!checked && (
                    <button
                      className="ml-auto text-xs text-muted hover:text-red-500"
                      onClick={() => setOrder((o) => o.filter((x) => x !== item))}
                    >
                      remove
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap gap-2">
            {remainingOrderOptions.map((opt) => (
              <button
                key={opt}
                disabled={checked}
                onClick={() => setOrder((o) => [...o, opt])}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
          {order.length > 0 && !checked && (
            <button
              onClick={() => setOrder([])}
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
            >
              <RotateCcw size={12} /> Reset order
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrectOpt = checked && normalize(opt) === normalize(question.correctAnswer as string);
            const isWrongSelected = checked && isSelected && !isCorrectOpt;
            return (
              <button
                key={opt}
                disabled={checked}
                onClick={() => setSelected(opt)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition-colors",
                  !checked && isSelected && "border-primary bg-primary/5",
                  !checked && !isSelected && "border-border hover:bg-surface-muted",
                  isCorrectOpt && "border-emerald-500 bg-emerald-500/10",
                  isWrongSelected && "border-red-400 bg-red-500/10",
                  checked && !isSelected && !isCorrectOpt && "opacity-60"
                )}
              >
                <span>{opt}</span>
                {isCorrectOpt && <CheckCircle2 size={18} className="text-emerald-600" />}
                {isWrongSelected && <XCircle size={18} className="text-red-500" />}
              </button>
            );
          })}
        </div>
      )}

      {!checked ? (
        <Button className="mt-5" onClick={handleCheck} disabled={!canCheck}>
          Check answer
        </Button>
      ) : (
        <div
          className={cn(
            "mt-5 rounded-2xl border p-4",
            result?.correct
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-red-400/30 bg-red-500/5"
          )}
        >
          <div className="flex items-center gap-2 font-semibold">
            {result?.correct ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-emerald-700">Correct!</span>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-red-500" />
                <span className="text-red-600">Not quite</span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed">{question.explanation}</p>
          {isFillBlank && !result?.correct && (
            <p className="mt-1 text-sm text-muted">
              Correct answer: <strong>{question.correctAnswer as string}</strong>
            </p>
          )}
          {isOrdering && !result?.correct && (
            <p className="mt-1 text-sm text-muted">
              Correct order: {(question.correctAnswer as string[]).join(" → ")}
            </p>
          )}
          {question.relevantExcerpt && (
            <div className="mt-3 flex gap-2 rounded-xl bg-surface-muted p-3 text-sm italic text-muted">
              <Quote size={14} className="mt-0.5 shrink-0 text-primary" />
              <span>{question.relevantExcerpt}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
