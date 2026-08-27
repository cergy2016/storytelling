"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2, BookmarkPlus, BookmarkCheck, Languages } from "lucide-react";
import { Story, VocabularyWord } from "@/types";
import { useProgressStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Renders a paragraph of story text with vocabulary words made clickable. */
export function ClickableParagraph({
  text,
  story,
  className,
}: {
  text: string;
  story: Story;
  className?: string;
}) {
  const vocabulary = story.vocabulary;
  const [active, setActive] = useState<{ word: VocabularyWord; rect: DOMRect } | null>(
    null
  );

  const pattern = useMemo(() => {
    if (!vocabulary.length) return null;
    const words = [...vocabulary]
      .map((v) => v.word)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegex);
    return new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  }, [vocabulary]);

  const parts = useMemo(() => {
    if (!pattern) return [text];
    return text.split(pattern);
  }, [text, pattern]);

  const findVocab = (token: string) =>
    vocabulary.find((v) => v.word.toLowerCase() === token.toLowerCase());

  return (
    <>
      <p className={cn("reading-content", className)}>
        {parts.map((part, i) => {
          const vocab = findVocab(part);
          if (vocab) {
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setActive({ word: vocab, rect });
                }}
                className="rounded px-0.5 font-medium text-primary underline decoration-primary/40 decoration-2 underline-offset-4 transition-colors hover:bg-primary/10"
              >
                {part}
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
      {active && (
        <WordPopover
          word={active.word}
          story={story}
          anchorRect={active.rect}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

function WordPopover({
  word,
  story,
  anchorRect,
  onClose,
}: {
  word: VocabularyWord;
  story: Story;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const vocabEntries = useProgressStore((s) => s.vocabulary);
  const saved = !!vocabEntries[word.word.toLowerCase()];

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const viewportWidth = window.innerWidth;
  const width = 300;
  let left = anchorRect.left + anchorRect.width / 2 - width / 2;
  left = Math.max(12, Math.min(left, viewportWidth - width - 12));
  const top = anchorRect.bottom + window.scrollY + 8;

  const speak = () => {
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(word.word);
      utter.lang = "en-US";
      window.speechSynthesis.speak(utter);
    }
  };

  return createPortal(
    <div
      ref={ref}
      style={{ position: "absolute", top, left, width }}
      className="z-50 rounded-2xl border border-border bg-surface p-4 shadow-xl animate-in fade-in zoom-in-95"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-serif text-lg font-semibold capitalize">{word.word}</h4>
            <button
              onClick={speak}
              aria-label="Pronounce"
              className="rounded-full p-1 text-primary hover:bg-primary/10"
            >
              <Volume2 size={15} />
            </button>
          </div>
          <p className="text-xs text-muted">
            {word.partOfSpeech} · {word.pronunciation}
          </p>
        </div>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed">{word.definition}</p>
      <p className="mt-2 rounded-lg bg-surface-muted px-2.5 py-2 text-sm italic text-muted">
        “{word.example}”
      </p>

      {word.translation && (
        <button
          onClick={() => setShowTranslation((s) => !s)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
        >
          <Languages size={13} />
          {showTranslation ? word.translation : "Show translation"}
        </button>
      )}

      <SaveButton word={word} story={story} saved={saved} />
    </div>,
    document.body
  );
}

function SaveButton({
  word,
  story,
  saved,
}: {
  word: VocabularyWord;
  story: Story;
  saved: boolean;
}) {
  const addVocabWord = useProgressStore((s) => s.addVocabWord);
  const [justSaved, setJustSaved] = useState(false);

  return (
    <button
      onClick={() => {
        addVocabWord(story, word.word);
        setJustSaved(true);
      }}
      disabled={saved || justSaved}
      className={cn(
        "mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors",
        saved || justSaved
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-primary text-primary-foreground hover:opacity-90"
      )}
    >
      {saved || justSaved ? (
        <>
          <BookmarkCheck size={15} /> Added to vocabulary
        </>
      ) : (
        <>
          <BookmarkPlus size={15} /> Add to vocabulary
        </>
      )}
    </button>
  );
}
