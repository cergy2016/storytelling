import { Story } from "@/types";
import { a1Stories } from "./a1";
import { a2Stories } from "./a2";
import { b1Stories } from "./b1";
import { b2Stories } from "./b2";
import { c1Stories } from "./c1";
import { c2Stories } from "./c2";
import { a1ClassicStories } from "./a1-classics";
import { a2ClassicStories } from "./a2-classics";
import { b1ClassicStories } from "./b1-classics";
import { b2ClassicStories } from "./b2-classics";
import { c1ClassicStories } from "./c1-classics";
import { c2ClassicStories } from "./c2-classics";

export const allStories: Story[] = [
  ...a1Stories,
  ...a1ClassicStories,
  ...a2Stories,
  ...a2ClassicStories,
  ...b1Stories,
  ...b1ClassicStories,
  ...b2Stories,
  ...b2ClassicStories,
  ...c1Stories,
  ...c1ClassicStories,
  ...c2Stories,
  ...c2ClassicStories,
];

export function getStoryById(id: string): Story | undefined {
  return allStories.find((s) => s.id === id);
}

export function getStoriesByLevel(level: Story["level"]): Story[] {
  return allStories.filter((s) => s.level === level);
}

export function getNextStory(current: Story): Story | undefined {
  const sameLevelIdx = getStoriesByLevel(current.level).findIndex(
    (s) => s.id === current.id
  );
  const sameLevel = getStoriesByLevel(current.level);
  if (sameLevelIdx >= 0 && sameLevelIdx < sameLevel.length - 1) {
    return sameLevel[sameLevelIdx + 1];
  }
  const levels: Story["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const li = levels.indexOf(current.level);
  for (let i = li + 1; i < levels.length; i++) {
    const stories = getStoriesByLevel(levels[i]);
    if (stories.length) return stories[0];
  }
  return undefined;
}
