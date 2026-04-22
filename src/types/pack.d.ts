export type Theme =
  | "training"
  | "mechanical"
  | "knowledge"
  | "communication"
  | "teamplay"
  | "attitude"
  | "mental"
  | "decision";

export interface Pack {
  id: string;
  name: string;
  theme: Theme;
  subtitle?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  scenarios: number;
  tier: number;
  price: string;
  imageUrl: string;
  scenarioIds: string[];
  tournament?: string;
  isPremium?: boolean;
}
