"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LineChart, BookOpen, Sparkles, RotateCcw, Pencil } from "lucide-react";
import { useProgressStore } from "@/lib/store";
import { earnedBadges } from "@/lib/badges";
import { LEVEL_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/level-badge";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const progress = useProgressStore();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const earned = earnedBadges(progress);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
          {progress.displayName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1 font-serif text-2xl font-semibold"
              />
              <Button
                size="sm"
                onClick={() => {
                  progress.setDisplayName(nameDraft || "Learner");
                  setEditingName(false);
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNameDraft(progress.displayName);
                setEditingName(true);
              }}
              className="flex items-center gap-2 font-serif text-2xl font-semibold hover:text-primary"
            >
              {progress.displayName}
              <Pencil size={15} className="text-muted" />
            </button>
          )}
          <div className="mt-1 flex items-center gap-2">
            <LevelBadge level={progress.currentLevel} />
            <span className="text-sm text-muted">{LEVEL_LABELS[progress.currentLevel]} learner</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="font-serif text-2xl font-semibold">{progress.completedStoryIds.length}</p>
          <p className="text-xs text-muted">Stories read</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-serif text-2xl font-semibold">{Object.keys(progress.vocabulary).length}</p>
          <p className="text-xs text-muted">Words learned</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-serif text-2xl font-semibold">{progress.xp}</p>
          <p className="text-xs text-muted">XP earned</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/progress">
          <Button variant="outline" className="w-full justify-start">
            <LineChart size={16} /> View full progress dashboard
          </Button>
        </Link>
        <Link href="/practice/placement-test">
          <Button variant="outline" className="w-full justify-start">
            <Sparkles size={16} /> Retake placement test
          </Button>
        </Link>
        <Link href="/vocabulary">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen size={16} /> Review saved vocabulary
          </Button>
        </Link>
        <Link href="/create">
          <Button variant="outline" className="w-full justify-start">
            <Sparkles size={16} /> Create My Story
          </Button>
        </Link>
      </div>

      {earned.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="mb-3 font-serif text-lg font-semibold">Latest achievements</h2>
          <div className="flex flex-wrap gap-3">
            {earned.slice(-6).map((b) => (
              <div key={b.id} className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-sm">
                <span>{b.icon}</span>
                {b.title}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6 flex items-center justify-between p-5">
        <div className="flex items-center gap-2 text-sm text-muted">
          <User size={16} />
          This app stores your progress locally in this browser — no account needed.
        </div>
      </Card>

      <button
        onClick={() => {
          if (confirm("Reset all your progress? This cannot be undone.")) progress.reset();
        }}
        className="mt-6 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline"
      >
        <RotateCcw size={13} /> Reset all progress
      </button>
    </div>
  );
}
