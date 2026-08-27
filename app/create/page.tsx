"use client";

import { useState } from "react";
import { Wand2, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { CEFR_LEVELS, CATEGORIES, CEFRLevel, Category, Story, QuizAnswerRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StoryReader } from "@/components/story-reader";
import { Quiz } from "@/components/quiz";
import { QuizResults } from "@/components/quiz-results";
import { VocabularyReview } from "@/components/vocabulary-review";
import { SpeakingPractice } from "@/components/speaking-practice";
import { useProgressStore } from "@/lib/store";
import { LEVEL_LABELS } from "@/types";

export default function CreateStoryPage() {
  const [level, setLevel] = useState<CEFRLevel>("B1");
  const [topic, setTopic] = useState<Category>("Mystery");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [vocabularyFocus, setVocabularyFocus] = useState("");
  const [grammarFocus, setGrammarFocus] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [source, setSource] = useState<"ai" | "template" | null>(null);

  const [quizResult, setQuizResult] = useState<{
    correct: number;
    total: number;
    answers: QuizAnswerRecord[];
  } | null>(null);
  const completeStory = useProgressStore((s) => s.completeStory);
  const recordQuizScore = useProgressStore((s) => s.recordQuizScore);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setStory(null);
    setQuizResult(null);
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ level, topic, length, vocabularyFocus, grammarFocus, customPrompt }),
      });
      const data = await res.json();
      setStory(data.story);
      setSource(data.source);
    } catch {
      setError("Something went wrong generating your story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <Wand2 size={30} className="mx-auto text-primary" />
        <h1 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Create My Story</h1>
        <p className="mt-2 text-muted">
          Generate a brand-new story tailored to your level, topic, and the grammar or
          vocabulary you want to practice.
        </p>
      </div>

      {!story && (
        <Card className="mt-8 space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">English level</label>
            <div className="flex flex-wrap gap-2">
              {CEFR_LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    level === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
                  }`}
                >
                  {l} · {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as Category)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Length</label>
            <div className="flex gap-2">
              {(["short", "medium", "long"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                    length === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Grammar focus</label>
              <input
                value={grammarFocus}
                onChange={(e) => setGrammarFocus(e.target.value)}
                placeholder="e.g. past tenses"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Vocabulary focus</label>
              <input
                value={vocabularyFocus}
                onChange={(e) => setVocabularyFocus(e.target.value)}
                placeholder="e.g. travel vocabulary"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Anything else? <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder='e.g. "A mystery about a missing passport at an airport"'
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button size="lg" className="w-full" onClick={generate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Writing your story…
              </>
            ) : (
              <>
                Generate story <ArrowRight size={16} />
              </>
            )}
          </Button>
        </Card>
      )}

      {story && (
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {source === "ai" ? "AI-generated story" : "Generated story"}
            </p>
            <button
              onClick={() => {
                setStory(null);
                setQuizResult(null);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <RotateCcw size={13} /> Create another
            </button>
          </div>

          <StoryReader story={story} />

          <section className="mt-16">
            <h2 className="mb-6 font-serif text-2xl font-semibold">Comprehension Quiz</h2>
            {!quizResult ? (
              <Card className="p-6 sm:p-8">
                <Quiz
                  story={story}
                  onComplete={(correct, total, answers) => {
                    setQuizResult({ correct, total, answers });
                    recordQuizScore(story.id, correct, total, answers);
                    completeStory(story);
                  }}
                />
              </Card>
            ) : (
              <QuizResults story={story} correct={quizResult.correct} total={quizResult.total} answers={quizResult.answers} />
            )}
          </section>

          {quizResult && (
            <>
              <section className="mt-16">
                <VocabularyReview story={story} />
              </section>
              <section className="mt-16">
                <SpeakingPractice story={story} />
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
