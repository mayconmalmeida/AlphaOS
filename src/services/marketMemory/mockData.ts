import type { MarketSnapshot } from "@/services/marketMemory/types"

export const mockSnapshots: MarketSnapshot[] = [
  {
    id: "s-2023-01-14",
    date: "2023-01-14",
    title: "AI Expansion (Early Wave)",
    summary:
      "The AI narrative emerges as an infrastructure repricing story. Liquidity concentrates in leaders and the market accepts higher multiples.",
    marketPulse: {
      btcDominance: 44.8,
      fearGreed: 48,
      marketCapUsd: 1.02e12,
      volume24hUsd: 6.4e10,
      sentimentScore: 0.12,
      newsMomentum: 0.28,
    },
    narratives: [
      { name: "AI", strength: 71, velocity: 62, growth: 55 },
      { name: "Infrastructure", strength: 66, velocity: 58, growth: 49 },
      { name: "Layer 2", strength: 53, velocity: 47, growth: 42 },
      { name: "Gaming", strength: 38, velocity: 32, growth: 29 },
    ],
    context: {
      historicalContext:
        "The market was coming out of a risk-compression phase. The first narrative wave created a new attention regime with low dispersion.",
      whatHappenedNext:
        "In the following weeks, the narrative expanded into infrastructure and toolchains. Rotation favored leaders and punished the long tail.",
    },
  },
  {
    id: "s-2024-03-18",
    date: "2024-03-18",
    title: "Liquidity Rotation (Memecoins → AI)",
    summary:
      "High-beta speculation starts losing momentum. Flow rotates into productivity narratives and sentiment improves as volatility cools.",
    marketPulse: {
      btcDominance: 50.6,
      fearGreed: 67,
      marketCapUsd: 2.19e12,
      volume24hUsd: 9.7e10,
      sentimentScore: 0.38,
      newsMomentum: 0.62,
    },
    narratives: [
      { name: "Memecoins", strength: 58, velocity: 41, growth: 33 },
      { name: "AI", strength: 82, velocity: 71, growth: 63 },
      { name: "Infrastructure", strength: 74, velocity: 60, growth: 54 },
      { name: "RWA", strength: 49, velocity: 44, growth: 39 },
    ],
    context: {
      historicalContext:
        "Expansion phase with signs of high-beta saturation. Rotation suggests a search for quality and more durable narratives.",
      whatHappenedNext:
        "Rotation reinforced a second infrastructure cycle. Projects with real usage and revenue quality repriced higher while memecoins retraced.",
    },
  },
  {
    id: "s-2025-09-06",
    date: "2025-09-06",
    title: "Risk-Off (Volatility Shock)",
    summary:
      "The market cuts risk as volatility accelerates. Focus shifts to BTC and defensive positioning while narratives lose strength.",
    marketPulse: {
      btcDominance: 57.9,
      fearGreed: 31,
      marketCapUsd: 1.87e12,
      volume24hUsd: 1.38e11,
      sentimentScore: -0.22,
      newsMomentum: 0.51,
    },
    narratives: [
      { name: "Bitcoin", strength: 84, velocity: 69, growth: 52 },
      { name: "Stablecoins", strength: 63, velocity: 55, growth: 44 },
      { name: "AI", strength: 44, velocity: 31, growth: 22 },
      { name: "Gaming", strength: 28, velocity: 18, growth: 12 },
    ],
    context: {
      historicalContext:
        "An exogenous shock widens spreads and crushes appetite for the long tail. The market starts prioritizing liquidity and clarity of flow.",
      whatHappenedNext:
        "The recovery was led by BTC. Narratives returned gradually only after volume stabilized and headline noise faded.",
    },
  },
  {
    id: "s-2026-06-11",
    date: "2026-06-11",
    title: "Current Market (Narrative-Driven Expansion)",
    summary:
      "The market is pricing an infrastructure and productivity cycle. Attention is concentrating in a handful of narratives, leaving asymmetry in higher-quality setups.",
    marketPulse: {
      btcDominance: 53.2,
      fearGreed: 62,
      marketCapUsd: 2.78e12,
      volume24hUsd: 1.12e11,
      sentimentScore: 0.58,
      newsMomentum: 0.64,
    },
    narratives: [
      { name: "AI", strength: 86, velocity: 72, growth: 61 },
      { name: "Infrastructure", strength: 74, velocity: 60, growth: 54 },
      { name: "RWA", strength: 64, velocity: 58, growth: 52 },
      { name: "DePIN", strength: 58, velocity: 55, growth: 48 },
    ],
    context: {
      historicalContext:
        "The structure resembles early narrative-expansion periods with rising liquidity. Dispersion remains contained and consensus has not fully priced the why-now yet.",
      whatHappenedNext:
        "In comparable phases, continuation depends on volume holding up and validation events such as partnerships, adoption, or metrics. Invalidations usually come from volatility shocks or abrupt dispersion.",
    },
  },
]

