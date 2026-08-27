import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen size={13} />
          </span>
          StoryLevel English
        </div>
        <p className="text-center">Read. Listen. Understand. Speak. &copy; {new Date().getFullYear()}</p>
        <div className="flex gap-4">
          <Link href="/stories" className="hover:text-foreground">Stories</Link>
          <Link href="/practice/placement-test" className="hover:text-foreground">Placement Test</Link>
          <Link href="/create" className="hover:text-foreground">Create My Story</Link>
        </div>
      </div>
    </footer>
  );
}
