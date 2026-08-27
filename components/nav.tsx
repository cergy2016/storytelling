"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Home,
  Layers,
  Sparkles,
  Dumbbell,
  LineChart,
  CalendarDays,
  User,
  Menu,
  X,
  Moon,
  Sun,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { useProgressStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/levels", label: "Levels", icon: Layers },
  { href: "/vocabulary", label: "Vocabulary", icon: Sparkles },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/daily", label: "Daily Story", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: User },
];

function StreakPill() {
  const [mounted, setMounted] = useState(false);
  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard to avoid SSR/localStorage hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-24" />;
  return (
    <div className="hidden items-center gap-3 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold sm:flex">
      <span className="flex items-center gap-1 text-accent">
        <Flame size={14} /> {streak}
      </span>
      <span className="h-3 w-px bg-border" />
      <span className="text-primary">{xp} XP</span>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen size={17} />
          </span>
          StoryLevel <span className="text-primary">English</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <StreakPill />
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                    active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-muted"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
