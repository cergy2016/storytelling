# StoryLevel English

A premium, story-based English learning app. Read or listen to original stories
written specifically for each CEFR level (A1–C2), test comprehension with
interactive quizzes, build vocabulary, practice speaking, and track progress —
all in one learning loop: **discover → read/listen → understand → answer →
learn vocabulary → speak → track progress → next story**.

## Features

- **30 original stories**, 5 per CEFR level (A1–C2), across 13 topic categories,
  each genuinely written for its level's vocabulary, grammar, and cognitive
  complexity — not just longer or shorter versions of the same text.
- **Immersive reader**: adjustable font size, dark/light reading mode, browser
  text-to-speech narration with speed control (0.75x–1.5x), paragraph repeat,
  and a "Listen First" mode.
- **Clickable vocabulary** with definitions, pronunciation, example sentences,
  and one-tap saving to a personal vocabulary bank.
- **Comprehension quizzes** with 10 question types (multiple choice, true/false,
  fill-in-the-blank, ordering, who-said-it, inference, main idea, and more),
  instant feedback, and explanations tied to the story text.
- **Vocabulary review**: flashcards and quick quizzes, both per-story and across
  your whole saved vocabulary.
- **Speaking practice** with guided prompts and live feedback (pace, filler
  words, fluency) via the browser's speech recognition API.
- **Progress dashboard**: XP, streaks, reading/listening/speaking minutes, quiz
  averages, and an achievement system.
- **Placement test** that estimates your CEFR level from a short vocabulary,
  grammar, and reading test.
- **Daily Story** with a 5-minute goal and XP reward.
- **Create My Story**: generate a brand-new story at your level, topic, and
  grammar/vocabulary focus (uses the Anthropic API when `ANTHROPIC_API_KEY` is
  set; otherwise falls back to a built-in template generator).

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion ·
Lucide icons · Zustand (persisted to `localStorage`)

Progress and vocabulary are stored locally in the browser — no account or
backend required to use the app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable AI-generated stories in "Create My Story", set an API key:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev
```

## Project structure

- `data/stories/` — the story content library (one file per CEFR level)
- `data/placement-test.ts` — placement test question bank
- `types/index.ts` — core domain types (`Story`, `Question`, `ProgressState`, …)
- `lib/store.ts` — Zustand store for learner progress
- `components/` — reusable UI (`StoryCard`, `StoryReader`, `Quiz`,
  `VocabularyReview`, `SpeakingPractice`, `ProgressDashboard` pieces, …)
- `app/` — routes: home, stories library, story detail, levels, vocabulary,
  practice, progress, daily story, profile, placement test, story generator
