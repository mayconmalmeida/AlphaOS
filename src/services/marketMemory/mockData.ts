import type { MarketSnapshot } from "@/services/marketMemory/types"

export const mockSnapshots: MarketSnapshot[] = [
  {
    id: "s-2023-01-14",
    date: "2023-01-14",
    title: "AI Expansion (Early Wave)",
    summary:
      "A narrativa de IA surge como reprecificação de infra. Liquidez se concentra em nomes líderes e o mercado aceita múltiplos mais altos.",
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
        "O mercado vinha de um período de compressão de risco. A primeira onda de narrativa cria um novo regime de atenção com baixa dispersão.",
      whatHappenedNext:
        "Nas semanas seguintes, a narrativa se expandiu para infra e toolchains. A rotação favoreceu líderes e penalizou cauda longa.",
    },
  },
  {
    id: "s-2024-03-18",
    date: "2024-03-18",
    title: "Liquidity Rotation (Memecoins → AI)",
    summary:
      "Alta beta começa a perder força. O fluxo migra para narrativas de produtividade. Sentimento melhora com queda de volatilidade.",
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
        "Fase de expansão com sinais de saturação em alta beta. A rotação sugere busca por qualidade e narrativas sustentáveis.",
      whatHappenedNext:
        "A rotação reforçou um segundo ciclo de infra. Projetos com receitas/uso real tiveram repricing, enquanto memes retrairam.",
    },
  },
  {
    id: "s-2025-09-06",
    date: "2025-09-06",
    title: "Risk-Off (Volatility Shock)",
    summary:
      "O mercado corta risco com aceleração de volatilidade. O foco migra para BTC e defensivos. Narrativas perdem força.",
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
        "Shock exógeno amplia spreads e derruba apetite por cauda longa. O mercado privilegia liquidez e clareza de fluxo.",
      whatHappenedNext:
        "A recuperação foi liderada por BTC. Narrativas retornaram lentamente após estabilização do volume e redução do ruído de notícias.",
    },
  },
  {
    id: "s-2026-06-11",
    date: "2026-06-11",
    title: "Current Market (Narrative-Driven Expansion)",
    summary:
      "O mercado precifica um ciclo de infra e produtividade. A atenção se consolida em poucas narrativas. Há assimetria em setups de qualidade.",
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
        "A estrutura lembra períodos iniciais de expansão de narrativa com liquidez crescente. A dispersão está contida e o consenso ainda não capturou o ‘why now’.",
      whatHappenedNext:
        "Em fases semelhantes, a continuidade depende de manutenção do volume e de eventos de validação (parcerias, adoção, métricas). A invalidação tende a vir de choque de volatilidade ou dispersão abrupta.",
    },
  },
]

