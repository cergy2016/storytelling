import {
  Turtle,
  PiggyBank,
  AlertTriangle,
  Grape,
  PawPrint,
  Shirt,
  ShoppingBasket,
  PlaneTakeoff,
  Smartphone,
  Mail,
  Crown,
  BedDouble,
  Ghost,
  Wind,
  Feather,
  Mountain,
  Briefcase,
  PartyPopper,
  Umbrella,
  Footprints,
  Gift,
  Gem,
  LandPlot,
  DoorOpen,
  Luggage,
  CalendarClock,
  Hand,
  ChefHat,
  Coins,
  Flame,
  Leaf,
  Link2,
  Wine,
  TrendingUp,
  Globe,
  Lamp,
  FlaskConical,
  Waves,
  Ear,
  EyeOff,
  DoorClosed,
  Ban,
  Clock,
  Languages,
  Search,
  ArrowLeftRight,
  Cpu,
  Compass,
  Hourglass,
  Drama,
  Bird,
  Image,
  Map,
  Archive,
  Megaphone,
  BarChart3,
  Landmark,
  type LucideIcon,
} from "lucide-react";

/**
 * A specific, thematically-fitting icon for each story (rather than just the
 * broad category icon), so every cover feels individually designed. These
 * are original vector icons from the Lucide set already used throughout the
 * app — no external images/photos are fetched or licensed.
 */
export const STORY_ICON: Record<string, LucideIcon> = {
  // A1
  "a1-c1": Turtle,
  "a1-c2": PiggyBank,
  "a1-c3": AlertTriangle,
  "a1-c4": Grape,
  "a1-c5": PawPrint,
  "a1-1": Shirt,
  "a1-2": ShoppingBasket,
  "a1-3": PlaneTakeoff,
  "a1-4": Smartphone,
  "a1-5": Mail,
  // A2
  "a2-c1": Crown,
  "a2-c2": BedDouble,
  "a2-c3": Ghost,
  "a2-c4": Wind,
  "a2-c5": Feather,
  "a2-1": Mountain,
  "a2-2": Briefcase,
  "a2-3": PartyPopper,
  "a2-4": Umbrella,
  "a2-5": Footprints,
  // B1
  "b1-c1": Gift,
  "b1-c2": AlertTriangle,
  "b1-c3": Gem,
  "b1-c4": LandPlot,
  "b1-c5": DoorOpen,
  "b1-1": Luggage,
  "b1-2": CalendarClock,
  "b1-3": Hand,
  "b1-4": Smartphone,
  "b1-5": ChefHat,
  // B2
  "b2-c1": Coins,
  "b2-c2": Flame,
  "b2-c3": Leaf,
  "b2-c4": Link2,
  "b2-c5": Wine,
  "b2-1": TrendingUp,
  "b2-2": Globe,
  "b2-3": Lamp,
  "b2-4": FlaskConical,
  "b2-5": Waves,
  // C1
  "c1-1classic": Ear,
  "c1-2classic": EyeOff,
  "c1-3classic": DoorClosed,
  "c1-4classic": Ban,
  "c1-5classic": Clock,
  "c1-1": Languages,
  "c1-2": Search,
  "c1-3": ArrowLeftRight,
  "c1-4": Cpu,
  "c1-5": Compass,
  // C2
  "c2-c1": Hourglass,
  "c2-c2": Drama,
  "c2-c3": Bird,
  "c2-c4": Waves,
  "c2-c5": Image,
  "c2-1": Map,
  "c2-2": Archive,
  "c2-3": Megaphone,
  "c2-4": BarChart3,
  "c2-5": Landmark,
};

/** Small deterministic hash so each story's decorative pattern differs. */
function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Per-story rotation/position tweak for the cover's decorative blur shapes. */
export function getCoverVariant(storyId: string) {
  const h = hashString(storyId);
  return {
    rotate: (h % 24) - 12, // -12..12 deg
    shift: (h % 10) - 5, // -5..5 %
  };
}
