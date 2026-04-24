export type ModeDifficulty = "easy" | "medium" | "hard";

export const ELO_HARD_MIN = 1100;
export const ELO_EASY_MAX = 1299;

export function getDifficultyGate(elo: number): Record<ModeDifficulty, { locked: boolean; reason?: string }> {
  return {
    easy:   {
      locked: elo > ELO_EASY_MAX,
      reason: elo > ELO_EASY_MAX ? `ELO too high (max ${ELO_EASY_MAX})` : undefined,
    },
    medium: { locked: false },
    hard:   {
      locked: elo < ELO_HARD_MIN,
      reason: elo < ELO_HARD_MIN ? `Reach ${ELO_HARD_MIN} ELO to unlock` : undefined,
    },
  };
}

export function getDefaultDifficulty(elo: number): ModeDifficulty {
  if (elo > ELO_EASY_MAX) return "medium";
  if (elo < ELO_HARD_MIN) return "easy";
  return "medium";
}

export const DIFFICULTY_ELO_FACTOR: Record<ModeDifficulty, number> = {
  easy:   0.6,
  medium: 0.9,
  hard:   1.3,
};
