export const IP_PER_USD = 1000;
export const MIN_WITHDRAW_IP = 5000;
export const MAX_ACTIVE_PACKS_PER_USER = 5;

export type PackTier = {
  maxScenarios: number | null;
  priceUSD: number;
  priceIP: number;
  creatorShareIP: number;
  siteShareIP: number;
};

export const PACK_TIERS: PackTier[] = [
  {
    maxScenarios: 9,
    priceUSD: 1.99,
    priceIP: 1990,
    creatorShareIP: 1000,
    siteShareIP: 990,
  },
  {
    maxScenarios: 29,
    priceUSD: 3.99,
    priceIP: 3990,
    creatorShareIP: 2790,
    siteShareIP: 1200,
  },
  {
    maxScenarios: 49,
    priceUSD: 5.99,
    priceIP: 5990,
    creatorShareIP: 4190,
    siteShareIP: 1800,
  },
  {
    maxScenarios: null,
    priceUSD: 7.99,
    priceIP: 7990,
    creatorShareIP: 5590,
    siteShareIP: 2400,
  },
];

export function tierForScenarioCount(count: number): PackTier {
  for (const tier of PACK_TIERS) {
    if (tier.maxScenarios === null || count <= tier.maxScenarios) {
      return tier;
    }
  }
  return PACK_TIERS[PACK_TIERS.length - 1];
}

export function formatIP(amount: number): string {
  return amount.toLocaleString("en-US") + " IP";
}

export function ipToUSD(amount: number): number {
  return amount / IP_PER_USD;
}

export function usdToIP(amount: number): number {
  return Math.round(amount * IP_PER_USD);
}
