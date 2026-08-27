"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { allStories } from "@/data/stories";
import { CEFRLevel, Category } from "@/types";
import { StoryCard } from "@/components/story-card";
import { StoryFilters, DEFAULT_FILTERS, StoryFiltersState } from "@/components/story-filters";
import { useProgressStore } from "@/lib/store";

export default function StoriesPage() {
  return (
    <Suspense fallback={null}>
      <StoriesPageInner />
    </Suspense>
  );
}

function StoriesPageInner() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<StoryFiltersState>(DEFAULT_FILTERS);
  const [mounted, setMounted] = useState(false);
  const completedIds = useProgressStore((s) => s.completedStoryIds);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const level = searchParams.get("level") as CEFRLevel | null;
    const category = searchParams.get("category") as Category | null;
    if (level || category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- applies ?level=/?category= query params from an incoming link once on mount
      setFilters((f) => ({
        ...f,
        levels: level ? [level] : f.levels,
        categories: category ? [category] : f.categories,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return allStories.filter((s) => {
      if (filters.levels.length && !filters.levels.includes(s.level)) return false;
      if (filters.categories.length && !filters.categories.includes(s.category)) return false;
      if (filters.readingTime === "short" && s.readingTime >= 5) return false;
      if (filters.readingTime === "medium" && (s.readingTime < 5 || s.readingTime > 12)) return false;
      if (filters.readingTime === "long" && s.readingTime <= 12) return false;
      if (mounted) {
        const isDone = completedIds.includes(s.id);
        if (filters.completion === "completed" && !isDone) return false;
        if (filters.completion === "not-completed" && isDone) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !s.title.toLowerCase().includes(q) &&
          !s.description.toLowerCase().includes(q) &&
          !s.category.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [filters, mounted, completedIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Story Library</h1>
        <p className="mt-2 text-muted">
          {allStories.length} original stories across all six CEFR levels.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <StoryFilters value={filters} onChange={setFilters} />
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted">{filtered.length} stories</p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
              No stories match your filters yet. Try clearing a few.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
