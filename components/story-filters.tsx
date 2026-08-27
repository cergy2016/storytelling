"use client";

import { Search, X } from "lucide-react";
import { CATEGORIES, CEFR_LEVELS, Category, CEFRLevel } from "@/types";
import { LEVEL_BG_CLASS } from "@/lib/content-meta";
import { cn } from "@/lib/utils";

export type ReadingTimeFilter = "any" | "short" | "medium" | "long";
export type CompletionFilter = "any" | "completed" | "not-completed";

export interface StoryFiltersState {
  levels: CEFRLevel[];
  categories: Category[];
  readingTime: ReadingTimeFilter;
  completion: CompletionFilter;
  search: string;
}

export const DEFAULT_FILTERS: StoryFiltersState = {
  levels: [],
  categories: [],
  readingTime: "any",
  completion: "any",
  search: "",
};

export function StoryFilters({
  value,
  onChange,
}: {
  value: StoryFiltersState;
  onChange: (v: StoryFiltersState) => void;
}) {
  const toggleLevel = (level: CEFRLevel) => {
    onChange({
      ...value,
      levels: value.levels.includes(level)
        ? value.levels.filter((l) => l !== level)
        : [...value.levels, level],
    });
  };

  const toggleCategory = (cat: Category) => {
    onChange({
      ...value,
      categories: value.categories.includes(cat)
        ? value.categories.filter((c) => c !== cat)
        : [...value.categories, cat],
    });
  };

  const hasActiveFilters =
    value.levels.length ||
    value.categories.length ||
    value.readingTime !== "any" ||
    value.completion !== "any" ||
    value.search;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-5">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search stories…"
          className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          CEFR Level
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-bold transition-colors",
                value.levels.includes(level)
                  ? cn(LEVEL_BG_CLASS[level], "border-transparent text-white")
                  : "border-border text-muted hover:bg-surface-muted"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Topic</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                value.categories.includes(cat)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted hover:bg-surface-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Reading time
          </p>
          <select
            value={value.readingTime}
            onChange={(e) =>
              onChange({ ...value, readingTime: e.target.value as ReadingTimeFilter })
            }
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
          >
            <option value="any">Any length</option>
            <option value="short">Under 5 min</option>
            <option value="medium">5–12 min</option>
            <option value="long">12+ min</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </p>
          <select
            value={value.completion}
            onChange={(e) =>
              onChange({ ...value, completion: e.target.value as CompletionFilter })
            }
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
          >
            <option value="any">All stories</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not completed</option>
          </select>
        </div>
      </div>

      {!!hasActiveFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <X size={13} /> Clear all filters
        </button>
      )}
    </div>
  );
}
