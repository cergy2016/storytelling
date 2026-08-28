import { Category } from "@/types";
import { CATEGORY_ICON, CATEGORY_GRADIENT } from "@/lib/content-meta";
import { STORY_ICON, getCoverVariant } from "@/lib/story-art";
import { cn } from "@/lib/utils";

export function StoryCover({
  category,
  storyId,
  className,
  iconSize = 40,
}: {
  category: Category;
  /** When provided, uses a story-specific icon instead of the generic category icon. */
  storyId?: string;
  className?: string;
  iconSize?: number;
}) {
  const Icon = (storyId && STORY_ICON[storyId]) || CATEGORY_ICON[category];
  const variant = getCoverVariant(storyId ?? category);
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        CATEGORY_GRADIENT[category],
        className
      )}
      style={{ backgroundPosition: `${50 + variant.shift}% 50%` }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.08), transparent 45%)",
          transform: `rotate(${variant.rotate}deg)`,
        }}
      />
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/25 blur-xl" />
      <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-black/10 blur-xl" />
      <Icon
        size={iconSize}
        strokeWidth={1.4}
        className="relative text-black/55 drop-shadow-sm"
      />
    </div>
  );
}
