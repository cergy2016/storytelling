"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CEFRLevel,
  ProgressState,
  QuizAnswerRecord,
  Story,
  VocabStatus,
} from "@/types";
import { todayISO, daysBetween } from "./utils";

interface ProgressActions {
  completeStory: (story: Story) => void;
  recordQuizScore: (
    storyId: string,
    correct: number,
    total: number,
    answers: QuizAnswerRecord[]
  ) => void;
  addVocabWord: (story: Story, word: string) => void;
  setVocabStatus: (word: string, status: VocabStatus) => void;
  removeVocabWord: (word: string) => void;
  addReadingMinutes: (mins: number) => void;
  addListeningMinutes: (mins: number) => void;
  addSpeakingMinutes: (mins: number) => void;
  setLevel: (level: CEFRLevel) => void;
  setPlacementResult: (level: CEFRLevel) => void;
  addXP: (amount: number) => void;
  touchActivity: () => void;
  setNote: (storyId: string, note: string) => void;
  completeDailyStory: () => void;
  setLastViewed: (storyId: string) => void;
  setDisplayName: (name: string) => void;
  reset: () => void;
}

const initialState: ProgressState = {
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  completedStoryIds: [],
  quizScores: {},
  vocabulary: {},
  readingMinutes: 0,
  listeningMinutes: 0,
  speakingMinutes: 0,
  currentLevel: "A1",
  placementTestResult: null,
  notes: {},
  dailyStoryDate: null,
  dailyStoryCompleted: false,
  lastViewedStoryId: null,
  displayName: "Learner",
};

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      touchActivity: () => {
        const today = todayISO();
        const { lastActiveDate, streak, longestStreak } = get();
        if (lastActiveDate === today) return;
        let newStreak = 1;
        if (lastActiveDate) {
          const gap = daysBetween(lastActiveDate, today);
          if (gap === 1) newStreak = streak + 1;
          else if (gap === 0) newStreak = streak || 1;
        }
        set({
          lastActiveDate: today,
          streak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
        });
      },

      addXP: (amount) => set((s) => ({ xp: s.xp + amount })),

      completeStory: (story) => {
        get().touchActivity();
        set((s) => {
          if (s.completedStoryIds.includes(story.id)) return {};
          return {
            completedStoryIds: [...s.completedStoryIds, story.id],
            xp: s.xp + 20,
          };
        });
      },

      recordQuizScore: (storyId, correct, total, answers) => {
        get().touchActivity();
        set((s) => ({
          quizScores: {
            ...s.quizScores,
            [storyId]: { storyId, correct, total, date: todayISO(), answers },
          },
          xp: s.xp + correct * 5,
        }));
      },

      addVocabWord: (story, word) => {
        set((s) => {
          const entry = story.vocabulary.find(
            (v) => v.word.toLowerCase() === word.toLowerCase()
          );
          if (!entry) return {};
          if (s.vocabulary[word.toLowerCase()]) return {};
          return {
            vocabulary: {
              ...s.vocabulary,
              [word.toLowerCase()]: {
                word,
                storyId: story.id,
                storyTitle: story.title,
                level: story.level,
                status: "new" as VocabStatus,
                addedAt: todayISO(),
                entry,
              },
            },
            xp: s.xp + 2,
          };
        });
      },

      setVocabStatus: (word, status) =>
        set((s) => {
          const key = word.toLowerCase();
          if (!s.vocabulary[key]) return {};
          return {
            vocabulary: {
              ...s.vocabulary,
              [key]: { ...s.vocabulary[key], status },
            },
          };
        }),

      removeVocabWord: (word) =>
        set((s) => {
          const key = word.toLowerCase();
          const next = { ...s.vocabulary };
          delete next[key];
          return { vocabulary: next };
        }),

      addReadingMinutes: (mins) =>
        set((s) => ({ readingMinutes: s.readingMinutes + mins })),
      addListeningMinutes: (mins) =>
        set((s) => ({ listeningMinutes: s.listeningMinutes + mins })),
      addSpeakingMinutes: (mins) =>
        set((s) => ({ speakingMinutes: s.speakingMinutes + mins })),

      setLevel: (level) => set({ currentLevel: level }),
      setPlacementResult: (level) =>
        set({ placementTestResult: level, currentLevel: level }),

      setNote: (storyId, note) =>
        set((s) => ({ notes: { ...s.notes, [storyId]: note } })),

      completeDailyStory: () => {
        const today = todayISO();
        set((s) => ({
          dailyStoryDate: today,
          dailyStoryCompleted: true,
          xp: s.xp + 15,
        }));
      },

      setLastViewed: (storyId) => set({ lastViewedStoryId: storyId }),
      setDisplayName: (name) => set({ displayName: name }),

      reset: () => set(initialState),
    }),
    { name: "storylevel-progress" }
  )
);
