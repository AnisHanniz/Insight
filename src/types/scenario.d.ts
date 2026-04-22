import type { MapOverlay } from "./overlay";

export type OptionQuality = "perfect" | "excellent" | "good" | "blunder";

export interface ScenarioOption {
  id: number;
  text: string;
  quality?: OptionQuality;
  isCorrect?: boolean;
  feedback: string;
}

export interface Scenario {
  id: string;
  packId: string;
  theme?: string;
  subcategory?: string;
  map: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  overlay?: MapOverlay;
  macro: { title: string; description: string };
  micro: { title: string; description: string };
  communication: { title: string; description: string };
  options: ScenarioOption[];
}
