// Core domain types for Novella

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LEVEL_LABELS: Record<CEFRLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export const LEVEL_WORD_RANGE: Record<CEFRLevel, string> = {
  A1: "300–500 words",
  A2: "500–700 words",
  B1: "700–1,000 words",
  B2: "1,000–1,400 words",
  C1: "1,400–1,800 words",
  C2: "1,800–2,500 words",
};

export type Category =
  | "Everyday Life"
  | "Travel"
  | "Work & Business"
  | "Relationships"
  | "Mystery"
  | "Adventure"
  | "Culture"
  | "Food"
  | "Technology"
  | "Personal Growth"
  | "History"
  | "Science"
  | "True Stories";

export const CATEGORIES: Category[] = [
  "Everyday Life",
  "Travel",
  "Work & Business",
  "Relationships",
  "Mystery",
  "Adventure",
  "Culture",
  "Food",
  "Technology",
  "Personal Growth",
  "History",
  "Science",
  "True Stories",
];

export interface VocabularyWord {
  word: string;
  partOfSpeech: string; // e.g. "noun", "verb", "phrasal verb", "adjective"
  pronunciation: string; // simplified phonetic, e.g. "/dɪˈsaɪd/"
  definition: string; // simple English definition
  example: string; // example sentence (not necessarily from the story)
  translation?: string; // optional, kept minimal/off by default
}

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "meaning"
  | "fill-blank"
  | "ordering"
  | "who-said-it"
  | "vocab-in-context"
  | "main-idea"
  | "detail"
  | "inference";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Answer choices. For "ordering", these are the items to be put in order (in scrambled/display order). */
  options?: string[];
  /**
   * Correct answer. For most types this is a single string matching one of `options`
   * (or free text for fill-blank). For "ordering" this is the array of options in
   * correct order.
   */
  correctAnswer: string | string[];
  explanation: string;
  /** A short excerpt from the story text that justifies the answer, shown to the learner. */
  relevantExcerpt?: string;
}

export interface Story {
  id: string;
  title: string;
  level: CEFRLevel;
  category: Category;
  description: string;
  readingTime: number; // minutes
  wordCount: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  paragraphs: string[]; // story text, split into short sections
  vocabulary: VocabularyWord[];
  questions: Question[];
  speakingPrompts: string[];
  grammarFocus: string[];
  vocabularyFocus: string[];
  audioAvailable: boolean;
}

export interface QuizAnswerRecord {
  questionId: string;
  userAnswer: string | string[];
  correct: boolean;
}

export interface QuizScore {
  storyId: string;
  correct: number;
  total: number;
  date: string; // ISO date
  answers: QuizAnswerRecord[];
}

export type VocabStatus = "new" | "review" | "known";

export interface SavedVocabEntry {
  word: string;
  storyId: string;
  storyTitle: string;
  level: CEFRLevel;
  status: VocabStatus;
  addedAt: string;
  entry: VocabularyWord;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  check: (p: ProgressState) => boolean;
}

export interface ProgressState {
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  completedStoryIds: string[];
  quizScores: Record<string, QuizScore>;
  vocabulary: Record<string, SavedVocabEntry>;
  readingMinutes: number;
  listeningMinutes: number;
  speakingMinutes: number;
  currentLevel: CEFRLevel;
  placementTestResult: CEFRLevel | null;
  notes: Record<string, string>;
  dailyStoryDate: string | null;
  dailyStoryCompleted: boolean;
  lastViewedStoryId: string | null;
  displayName: string;
}
