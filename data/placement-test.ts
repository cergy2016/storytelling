import { CEFRLevel } from "@/types";

export interface PlacementQuestion {
  id: string;
  level: CEFRLevel;
  skill: "Vocabulary" | "Grammar" | "Reading";
  prompt: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1
  {
    id: "p-a1-1",
    level: "A1",
    skill: "Vocabulary",
    prompt: "Choose the word that means a place where you sleep.",
    options: ["Kitchen", "Bedroom", "Garden", "Office"],
    correctAnswer: "Bedroom",
  },
  {
    id: "p-a1-2",
    level: "A1",
    skill: "Grammar",
    prompt: "She _____ a teacher.",
    options: ["is", "are", "am", "be"],
    correctAnswer: "is",
  },
  {
    id: "p-a1-3",
    level: "A1",
    skill: "Reading",
    passage: "Tom gets up at 7am. He eats breakfast and goes to work by bus.",
    prompt: "How does Tom go to work?",
    options: ["By car", "By bus", "By train", "He walks"],
    correctAnswer: "By bus",
  },
  // A2
  {
    id: "p-a2-1",
    level: "A2",
    skill: "Vocabulary",
    prompt: "Choose the correct word: \"I was _____ because I forgot my keys.\"",
    options: ["excited", "frustrated", "relaxed", "proud"],
    correctAnswer: "frustrated",
  },
  {
    id: "p-a2-2",
    level: "A2",
    skill: "Grammar",
    prompt: "Tomorrow I _____ visit my grandmother.",
    options: ["am going to", "was", "did", "have"],
    correctAnswer: "am going to",
  },
  {
    id: "p-a2-3",
    level: "A2",
    skill: "Reading",
    passage:
      "Last weekend, Clara went camping with her friends. It rained on Saturday, so they stayed in their tent and played cards.",
    prompt: "Why did they stay in the tent?",
    options: ["It was too hot", "It rained", "They were tired", "The tent was new"],
    correctAnswer: "It rained",
  },
  // B1
  {
    id: "p-b1-1",
    level: "B1",
    skill: "Vocabulary",
    prompt: "\"I need to look into this problem\" most nearly means:",
    options: ["Ignore it", "Investigate it", "Forget it", "Solve it immediately"],
    correctAnswer: "Investigate it",
  },
  {
    id: "p-b1-2",
    level: "B1",
    skill: "Grammar",
    prompt: "If I _____ more time, I would learn another language.",
    options: ["have", "had", "will have", "having"],
    correctAnswer: "had",
  },
  {
    id: "p-b1-3",
    level: "B1",
    skill: "Reading",
    passage:
      "Marco had planned to drive to the coast, but after hearing the weather forecast, he decided to postpone the trip until the following weekend.",
    prompt: "Why did Marco postpone his trip?",
    options: [
      "His car broke down",
      "The weather forecast was bad",
      "He didn't have enough money",
      "His friends cancelled",
    ],
    correctAnswer: "The weather forecast was bad",
  },
  // B2
  {
    id: "p-b2-1",
    level: "B2",
    skill: "Vocabulary",
    prompt: "\"The company decided to phase out the old product line\" means they:",
    options: [
      "Launched it aggressively",
      "Gradually stopped producing it",
      "Redesigned it completely",
      "Sold it to a competitor",
    ],
    correctAnswer: "Gradually stopped producing it",
  },
  {
    id: "p-b2-2",
    level: "B2",
    skill: "Grammar",
    prompt: "By the time she arrived, the meeting _____ already _____.",
    options: ["has / started", "had / started", "was / starting", "have / started"],
    correctAnswer: "had / started",
  },
  {
    id: "p-b2-3",
    level: "B2",
    skill: "Reading",
    passage:
      "Although the researcher's initial results were promising, she remained cautious, aware that a single anomaly rarely justifies overturning an established theory.",
    prompt: "What can be inferred about the researcher's attitude?",
    options: [
      "She is overconfident about her results",
      "She is skeptical and wants more evidence",
      "She has already changed the theory",
      "She dismisses her own findings entirely",
    ],
    correctAnswer: "She is skeptical and wants more evidence",
  },
  // C1
  {
    id: "p-c1-1",
    level: "C1",
    skill: "Vocabulary",
    prompt: "\"His argument was riddled with inconsistencies\" means the argument was:",
    options: [
      "Extremely persuasive",
      "Full of contradictions",
      "Very brief",
      "Well documented",
    ],
    correctAnswer: "Full of contradictions",
  },
  {
    id: "p-c1-2",
    level: "C1",
    skill: "Grammar",
    prompt: "Rarely _____ such a compelling case for reform.",
    options: ["has been made", "has such a case been made", "a case has been made", "such a case was made"],
    correctAnswer: "has such a case been made",
  },
  {
    id: "p-c1-3",
    level: "C1",
    skill: "Reading",
    passage:
      "The committee's report, while ostensibly neutral, was peppered with phrasing that subtly favored the incumbent administration's position.",
    prompt: "What is implied about the committee's report?",
    options: [
      "It was completely unbiased",
      "It was openly and explicitly biased",
      "It had a subtle, hidden bias",
      "It criticized the administration harshly",
    ],
    correctAnswer: "It had a subtle, hidden bias",
  },
  // C2
  {
    id: "p-c2-1",
    level: "C2",
    skill: "Vocabulary",
    prompt: "\"A sardonic aside\" is best described as:",
    options: [
      "A cheerful compliment",
      "A mocking, bitterly ironic remark",
      "A formal announcement",
      "An enthusiastic endorsement",
    ],
    correctAnswer: "A mocking, bitterly ironic remark",
  },
  {
    id: "p-c2-2",
    level: "C2",
    skill: "Grammar",
    prompt: "Were it not for her intervention, the negotiations _____ collapsed entirely.",
    options: ["would have", "will have", "had", "would"],
    correctAnswer: "would have",
  },
  {
    id: "p-c2-3",
    level: "C2",
    skill: "Reading",
    passage:
      "The memoir's studied casualness — its offhand allusions to famous names, its careful omissions — betrayed an author far more concerned with legacy than the humility the prose affected.",
    prompt: "What does the passage suggest about the author's tone?",
    options: [
      "Genuinely humble and self-effacing",
      "Unintentionally revealing a calculated self-image",
      "Purely objective and factual",
      "Apologetic about their achievements",
    ],
    correctAnswer: "Unintentionally revealing a calculated self-image",
  },
];
