"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenCheck, NotebookPen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getStoryById, getNextStory } from "@/data/stories";
import { StoryReader } from "@/components/story-reader";
import { Quiz } from "@/components/quiz";
import { QuizResults } from "@/components/quiz-results";
import { VocabularyReview } from "@/components/vocabulary-review";
import { SpeakingPractice } from "@/components/speaking-practice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProgressStore } from "@/lib/store";
import { QuizAnswerRecord } from "@/types";

export default function StoryDetailPage() {
  const params = useParams<{ id: string }>();
  const story = useMemo(() => getStoryById(params.id), [params.id]);
  const nextStory = story ? getNextStory(story) : undefined;

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    correct: number;
    total: number;
    answers: QuizAnswerRecord[];
  } | null>(null);
  const [note, setNote] = useState("");

  const completeStory = useProgressStore((s) => s.completeStory);
  const recordQuizScore = useProgressStore((s) => s.recordQuizScore);
  const setNoteStore = useProgressStore((s) => s.setNote);
  const setLastViewed = useProgressStore((s) => s.setLastViewed);
  const savedNote = useProgressStore((s) => (story ? s.notes[story.id] : undefined));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs local draft when the saved note loads from persisted storage
    if (savedNote !== undefined) setNote(savedNote);
  }, [savedNote]);

  useEffect(() => {
    if (story) setLastViewed(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  if (!story) return notFound();

  const handleQuizComplete = (
    correct: number,
    total: number,
    answers: QuizAnswerRecord[]
  ) => {
    setQuizResult({ correct, total, answers });
    recordQuizScore(story.id, correct, total, answers);
    completeStory(story);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <StoryReader story={story} />

      {/* Comprehension Quiz */}
      <section className="mt-16">
        <div className="mb-6 flex items-center gap-2">
          <BookOpenCheck size={22} className="text-primary" />
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Comprehension Quiz
          </h2>
        </div>

        {!quizStarted ? (
          <Card className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="max-w-md text-muted">
              {story.questions.length} questions to check how well you understood the
              story. You&apos;ll see the correct answer and an explanation right after
              each one.
            </p>
            <Button size="lg" onClick={() => setQuizStarted(true)}>
              Start the quiz <ArrowRight size={16} />
            </Button>
          </Card>
        ) : !quizResult ? (
          <Card className="p-6 sm:p-8">
            <Quiz story={story} onComplete={handleQuizComplete} />
          </Card>
        ) : (
          <QuizResults
            story={story}
            correct={quizResult.correct}
            total={quizResult.total}
            answers={quizResult.answers}
            nextStory={nextStory}
          />
        )}
      </section>

      <AnimatePresence>
        {quizResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <section className="mt-16">
              <VocabularyReview story={story} />
            </section>

            <section className="mt-16">
              <SpeakingPractice story={story} />
            </section>

            <section className="mt-16">
              <Card className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <NotebookPen size={20} className="text-primary" />
                  <h2 className="font-serif text-xl font-semibold">Personal Notes</h2>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => setNoteStore(story.id, note)}
                  placeholder="Jot down thoughts, new expressions, or questions about this story…"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Card>
            </section>

            {nextStory && (
              <section className="mt-16 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Keep your streak going
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold">
                  Ready for the next story?
                </h3>
                <Link href={`/stories/${nextStory.id}`}>
                  <Button size="lg" className="mt-4">
                    Read &ldquo;{nextStory.title}&rdquo; <ArrowRight size={16} />
                  </Button>
                </Link>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
