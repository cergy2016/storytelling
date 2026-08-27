"use client";

import { useState } from "react";
import { Story, QuizAnswerRecord } from "@/types";
import { QuizQuestion } from "./quiz-question";
import { Progress } from "./ui/progress";

export function Quiz({
  story,
  onComplete,
}: {
  story: Story;
  onComplete: (correct: number, total: number, answers: QuizAnswerRecord[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const total = story.questions.length;

  const handleAnswered = (userAnswer: string | string[], correct: boolean) => {
    const record: QuizAnswerRecord = {
      questionId: story.questions[index].id,
      userAnswer,
      correct,
    };
    setAnswers((prev) => [...prev, record]);
  };

  const handleNext = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
    } else {
      const finalAnswers = [...answers];
      const correctCount = finalAnswers.filter((a) => a.correct).length;
      onComplete(correctCount, total, finalAnswers);
    }
  };

  const currentAnswered = answers.length > index;

  return (
    <div>
      <Progress value={((index + (currentAnswered ? 1 : 0)) / total) * 100} className="mb-6" />
      <QuizQuestion
        key={story.questions[index].id}
        question={story.questions[index]}
        index={index}
        total={total}
        onAnswered={handleAnswered}
      />
      {currentAnswered && (
        <button
          onClick={handleNext}
          className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:w-auto sm:px-8"
        >
          {index + 1 < total ? "Next question" : "See my results"}
        </button>
      )}
    </div>
  );
}
