import { allStories } from "@/data/stories";
import { todayISO } from "./utils";

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getDailyStory(dateISO: string = todayISO()) {
  const idx = hashString(dateISO) % allStories.length;
  return allStories[idx];
}
