export type Theme =
  | "training"
  | "mechanical"
  | "knowledge"
  | "communication"
  | "teamplay"
  | "attitude"
  | "mental"
  | "decision";

export type PackStatus = "draft" | "pending" | "approved" | "rejected";

export interface Pack {
  id: string;
  name: string;
  theme: Theme;
  subtitle?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  scenarios: number;
  tier?: number;
  price: string;
  imageUrl: string;
  scenarioIds?: string[];
  tournament?: string;
  isPremium?: boolean;
  isCommunity?: boolean;
  status?: PackStatus;
  priceIP?: number | null;
  creatorShareIP?: number | null;
  rejectionReason?: string | null;
  creatorId?: string | null;
  creator?: {
    id: string;
    name?: string | null;
    image?: string | null;
    creatorBadge?: boolean;
  } | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
}
