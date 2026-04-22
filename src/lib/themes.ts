import type { Theme } from "@/types/pack";
import type { OptionQuality } from "@/types/scenario";

export const THEMES: Record<
  Theme,
  {
    slug: Theme;
    name: string;
    tagline: string;
    description: string;
    subcategories: string[];
    gradient: string;
    accent: string;
    dot: string;
    badge: string;
  }
> = {
  training: {
    slug: "training",
    name: "Training & Preparation",
    tagline: "Build the routine that wins before the match starts",
    description:
      "Aim, deathmatch and aim training. Reviewing your own demos and the demos of players with the same role. Team demo review and strategy rehearsal.",
    subcategories: [
      "Aim (DM, aim training)",
      "Decisions (own demos, role models)",
      "Team (team demos, strategy rehearsal)",
    ],
    gradient: "from-orange-500/30 via-amber-500/10 to-transparent",
    accent: "text-orange-400",
    dot: "bg-orange-400",
    badge: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  },
  mechanical: {
    slug: "mechanical",
    name: "Mechanical Skills",
    tagline: "Crosshair, movement, utility — the raw fundamentals",
    description:
      "Crosshair placement, sensitivity and spray. Shoulder peeks, wide peeks, and reliable utility throws.",
    subcategories: [
      "Aim (crosshair, sensitivity, spray)",
      "Movement (shoulder peek, wide peek)",
      "Utilities",
    ],
    gradient: "from-red-500/30 via-rose-500/10 to-transparent",
    accent: "text-red-400",
    dot: "bg-red-400",
    badge: "bg-red-500/15 text-red-300 border border-red-500/30",
  },
  knowledge: {
    slug: "knowledge",
    name: "Game Knowledge",
    tagline: "META, strategies, tricks, money management",
    description:
      "Reading and adjusting the META, team strategies, positional and utility tricks, and managing your economy, your team's, and the opponent's.",
    subcategories: [
      "META",
      "Strategies",
      "Tricks (positions, utilities)",
      "Money management",
    ],
    gradient: "from-amber-400/30 via-yellow-500/10 to-transparent",
    accent: "text-amber-300",
    dot: "bg-amber-300",
    badge: "bg-amber-400/15 text-amber-200 border border-amber-400/30",
  },
  communication: {
    slug: "communication",
    name: "Communication",
    tagline: "Tone, information density, calls that don't waste",
    description:
      "Tone control. Information: what you cover, what you see, what you do. Clear, dense, usable comms.",
    subcategories: ["Tone", "What you cover", "What you see", "What you do"],
    gradient: "from-yellow-400/30 via-lime-400/10 to-transparent",
    accent: "text-yellow-300",
    dot: "bg-yellow-300",
    badge: "bg-yellow-400/15 text-yellow-200 border border-yellow-400/30",
  },
  teamplay: {
    slug: "teamplay",
    name: "Teamplay",
    tagline: "Crossfires, trading, spontaneous organization",
    description:
      "Crossfires, trading the entry (revenge), spontaneous organization when plans break, and the work ethic that holds a team together.",
    subcategories: [
      "Crossfires",
      "Trading (revenge)",
      "Spontaneous organization",
      "Work ethics",
    ],
    gradient: "from-green-500/30 via-emerald-500/10 to-transparent",
    accent: "text-green-400",
    dot: "bg-green-400",
    badge: "bg-green-500/15 text-green-300 border border-green-500/30",
  },
  attitude: {
    slug: "attitude",
    name: "Attitude",
    tagline: "Individual energy, team-grade behavior",
    description:
      "As an individual: promoting positive energy, refraining from spilling frustration. As a teammate: lifting the half instead of sinking it.",
    subcategories: [
      "As individual",
      "Promoting positive energy",
      "Refraining from spilling frustration",
      "As teammate",
    ],
    gradient: "from-cyan-500/30 via-sky-500/10 to-transparent",
    accent: "text-cyan-400",
    dot: "bg-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  },
  mental: {
    slug: "mental",
    name: "Mental Fortitude",
    tagline: "Focus when easy, 100% in losses, reset between rounds",
    description:
      "Staying focused when it's easy, playing at 100% when losing, and resetting your head between rounds and maps.",
    subcategories: [
      "Staying focused when it's easy",
      "Keep playing 100% in losses",
      "Mental reset between rounds/maps",
    ],
    gradient: "from-purple-500/30 via-violet-500/10 to-transparent",
    accent: "text-purple-400",
    dot: "bg-purple-400",
    badge: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  },
  decision: {
    slug: "decision",
    name: "Decision Making",
    tagline: "Powerplay, clutches, positioning, reading opponents",
    description:
      "When to powerplay, how to clutch, positioning that reads the map, and reading opponents off tempo and economy.",
    subcategories: ["Powerplay", "Clutches", "Positioning", "Reading opponents"],
    gradient: "from-pink-500/30 via-fuchsia-500/10 to-transparent",
    accent: "text-pink-400",
    dot: "bg-pink-400",
    badge: "bg-pink-500/15 text-pink-300 border border-pink-500/30",
  },
};

export const THEME_ORDER: Theme[] = [
  "training",
  "mechanical",
  "knowledge",
  "communication",
  "teamplay",
  "attitude",
  "mental",
  "decision",
];

export const QUALITY: Record<
  OptionQuality,
  { label: string; score: number; ring: string; bg: string; text: string }
> = {
  perfect: {
    label: "Perfect",
    score: 100,
    ring: "ring-emerald-400",
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
  },
  excellent: {
    label: "Excellent",
    score: 75,
    ring: "ring-green-400",
    bg: "bg-green-500/15",
    text: "text-green-300",
  },
  good: {
    label: "Good",
    score: 40,
    ring: "ring-yellow-400",
    bg: "bg-yellow-500/15",
    text: "text-yellow-300",
  },
  blunder: {
    label: "Blunder",
    score: 0,
    ring: "ring-red-500",
    bg: "bg-red-600/25",
    text: "text-red-300",
  },
};

export function qualityOf(o: { quality?: OptionQuality; isCorrect?: boolean }): OptionQuality {
  if (o.quality) return o.quality;
  return o.isCorrect ? "excellent" : "blunder";
}
