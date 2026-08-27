import { CEFRLevel, Category } from "@/types";
import {
  Coffee,
  Plane,
  Briefcase,
  Heart,
  Search,
  Compass,
  Landmark,
  UtensilsCrossed,
  Cpu,
  Sprout,
  ScrollText,
  FlaskConical,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  "Everyday Life": Coffee,
  Travel: Plane,
  "Work & Business": Briefcase,
  Relationships: Heart,
  Mystery: Search,
  Adventure: Compass,
  Culture: Landmark,
  Food: UtensilsCrossed,
  Technology: Cpu,
  "Personal Growth": Sprout,
  History: ScrollText,
  Science: FlaskConical,
  "True Stories": Newspaper,
};

export const CATEGORY_GRADIENT: Record<Category, string> = {
  "Everyday Life": "from-amber-200 via-orange-100 to-rose-100",
  Travel: "from-sky-200 via-cyan-100 to-teal-100",
  "Work & Business": "from-indigo-200 via-blue-100 to-slate-100",
  Relationships: "from-rose-200 via-pink-100 to-orange-100",
  Mystery: "from-slate-300 via-slate-200 to-indigo-100",
  Adventure: "from-emerald-200 via-lime-100 to-yellow-100",
  Culture: "from-fuchsia-200 via-purple-100 to-indigo-100",
  Food: "from-orange-200 via-amber-100 to-yellow-100",
  Technology: "from-cyan-200 via-sky-100 to-blue-100",
  "Personal Growth": "from-teal-200 via-emerald-100 to-lime-100",
  History: "from-yellow-200 via-amber-100 to-stone-100",
  Science: "from-violet-200 via-indigo-100 to-sky-100",
  "True Stories": "from-stone-300 via-neutral-200 to-amber-100",
};

export const LEVEL_COLOR_VAR: Record<CEFRLevel, string> = {
  A1: "var(--level-a1)",
  A2: "var(--level-a2)",
  B1: "var(--level-b1)",
  B2: "var(--level-b2)",
  C1: "var(--level-c1)",
  C2: "var(--level-c2)",
};

export const LEVEL_TEXT_CLASS: Record<CEFRLevel, string> = {
  A1: "text-level-a1",
  A2: "text-level-a2",
  B1: "text-level-b1",
  B2: "text-level-b2",
  C1: "text-level-c1",
  C2: "text-level-c2",
};

export const LEVEL_BG_CLASS: Record<CEFRLevel, string> = {
  A1: "bg-level-a1",
  A2: "bg-level-a2",
  B1: "bg-level-b1",
  B2: "bg-level-b2",
  C1: "bg-level-c1",
  C2: "bg-level-c2",
};
