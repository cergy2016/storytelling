"use client";

import { useEffect, useState } from "react";
import { Mic, Square, Gauge, Timer, MessageSquareText, Sparkles } from "lucide-react";
import { Story } from "@/types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useProgressStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SpeakingPractice({ story }: { story: Story }) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const { isSupported, isRecording, transcript, feedback, start, stop } =
    useSpeechRecognition();
  const addSpeakingMinutes = useProgressStore((s) => s.addSpeakingMinutes);

  useEffect(() => {
    if (feedback) {
      addSpeakingMinutes(feedback.durationSeconds / 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-accent" />
        <h2 className="font-serif text-2xl font-semibold">Speak About It</h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        Choose a prompt and record yourself speaking for 30–90 seconds.
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {story.speakingPrompts.map((p) => (
          <button
            key={p}
            onClick={() => setActivePrompt(p)}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
              activePrompt === p
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-surface-muted"
            )}
          >
            <MessageSquareText size={16} className="mt-0.5 shrink-0 text-primary" />
            {p}
          </button>
        ))}
      </div>

      {activePrompt && (
        <div className="mt-6 rounded-2xl border border-border bg-surface-muted p-5">
          <p className="mb-4 text-sm font-medium italic">&ldquo;{activePrompt}&rdquo;</p>

          {!isSupported ? (
            <p className="text-sm text-muted">
              Speech recognition is not supported in this browser. Try Chrome on desktop
              or Android, then record yourself out loud regardless — speaking practice
              still builds fluency.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <Button onClick={start}>
                    <Mic size={16} /> Start recording
                  </Button>
                ) : (
                  <Button variant="danger" onClick={stop}>
                    <Square size={14} /> Stop
                  </Button>
                )}
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-sm text-red-500">
                    <span className="h-2 w-2 animate-soft-pulse rounded-full bg-red-500" />
                    Listening…
                  </span>
                )}
              </div>

              {transcript && (
                <p className="mt-4 rounded-xl bg-surface p-3 text-sm text-muted">
                  {transcript}
                </p>
              )}

              {feedback && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox
                    icon={<Timer size={14} />}
                    label="Speaking time"
                    value={`${Math.round(feedback.durationSeconds)}s`}
                  />
                  <StatBox
                    icon={<MessageSquareText size={14} />}
                    label="Words spoken"
                    value={String(feedback.wordCount)}
                  />
                  <StatBox
                    icon={<Gauge size={14} />}
                    label="Pace"
                    value={`${feedback.wordsPerMinute} wpm`}
                  />
                  <StatBox
                    icon={<Sparkles size={14} />}
                    label="Clarity"
                    value={feedback.clarityLabel}
                  />
                  <StatBox
                    label="Filler words"
                    value={String(feedback.fillerCount)}
                    className="col-span-2 sm:col-span-2"
                  />
                  <StatBox
                    label="Fluency score"
                    value={`${feedback.fluencyScore} / 100`}
                    className="col-span-2 sm:col-span-2"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function StatBox({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-surface p-3 text-center", className)}>
      <div className="flex items-center justify-center gap-1 text-xs text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-serif text-lg font-semibold">{value}</p>
    </div>
  );
}
