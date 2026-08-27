import { ProgressState } from "@/types";

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (p: ProgressState) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-story",
    title: "First Story",
    icon: "🏆",
    description: "Complete your first story.",
    check: (p) => p.completedStoryIds.length >= 1,
  },
  {
    id: "ten-stories",
    title: "10 Stories Read",
    icon: "📚",
    description: "Complete 10 stories.",
    check: (p) => p.completedStoryIds.length >= 10,
  },
  {
    id: "twentyfive-stories",
    title: "Bookworm",
    icon: "📖",
    description: "Complete 25 stories.",
    check: (p) => p.completedStoryIds.length >= 25,
  },
  {
    id: "streak-7",
    title: "7-Day Streak",
    icon: "🔥",
    description: "Read for 7 days in a row.",
    check: (p) => p.streak >= 7 || p.longestStreak >= 7,
  },
  {
    id: "streak-30",
    title: "30-Day Streak",
    icon: "⚡",
    description: "Read for 30 days in a row.",
    check: (p) => p.streak >= 30 || p.longestStreak >= 30,
  },
  {
    id: "listen-60",
    title: "60 Minutes Listening",
    icon: "🎧",
    description: "Listen to 60 minutes of stories.",
    check: (p) => p.listeningMinutes >= 60,
  },
  {
    id: "words-100",
    title: "100 Words Learned",
    icon: "🧠",
    description: "Save 100 vocabulary words.",
    check: (p) => Object.keys(p.vocabulary).length >= 100,
  },
  {
    id: "words-25",
    title: "25 Words Learned",
    icon: "💡",
    description: "Save 25 vocabulary words.",
    check: (p) => Object.keys(p.vocabulary).length >= 25,
  },
  {
    id: "b2-reader",
    title: "B2 Reader",
    icon: "🚀",
    description: "Reach the B2 level.",
    check: (p) => ["B2", "C1", "C2"].includes(p.currentLevel),
  },
  {
    id: "c2-reader",
    title: "Proficiency Reached",
    icon: "👑",
    description: "Reach the C2 level.",
    check: (p) => p.currentLevel === "C2",
  },
  {
    id: "speaker",
    title: "First Words Spoken",
    icon: "🎤",
    description: "Complete a speaking practice recording.",
    check: (p) => p.speakingMinutes > 0,
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    icon: "🎯",
    description: "Get 100% on a comprehension quiz.",
    check: (p) =>
      Object.values(p.quizScores).some((s) => s.total > 0 && s.correct === s.total),
  },
];

export function earnedBadges(p: ProgressState): BadgeDef[] {
  return BADGES.filter((b) => b.check(p));
}
