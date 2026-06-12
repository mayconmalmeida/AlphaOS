import type { HypothesisDetail } from "@/services/hypotheses/types"

export const mockHypotheses: HypothesisDetail[] = [
  {
    id: "214",
    origin: "mock",
    title: "AI Infrastructure Expansion",
    description:
      "A assimetria está na infraestrutura de IA: demanda por compute, toolchains e middleware acelera enquanto o consenso ainda precifica ‘apenas narrativa’.",
    confidence: 91,
    riskScore: 34,
    expectedHorizon: "45 Days",
    status: "open",
    marketRegime: "Bull Expansion",
    relatedNarratives: ["AI", "Infrastructure"],
    relatedAssets: ["BTC", "ETH", "SOL"],
    evidenceCount: 9,
    whyNow:
      "Velocidade de narrativa se mantém alta com dispersão contida e sinais de rotação para qualidade. O mercado ainda está cedo no framing de infra como ‘produtividade’, não ‘hype’.",
    invalidatingConditions: [
      "Aumento abrupto de volatilidade + queda sustentada de volume",
      "Dispersão de narrativa (rotação para alta beta) sem confirmação de infra",
      "Eventos negativos de adoção/métricas em nomes líderes",
    ],
    narrativeSignals: [
      {
        name: "AI",
        strength: 86,
        velocity: 72,
        growth: 61,
        rotationScore: 68,
        interpretation:
          "Narrativa dominante com aceleração estável. Bom para hipóteses de continuidade, desde que volume não quebre.",
      },
      {
        name: "Infrastructure",
        strength: 74,
        velocity: 60,
        growth: 54,
        rotationScore: 61,
        interpretation:
          "Rotação para infra sugere busca por ‘qualidade’ após saturação em alta beta.",
      },
    ],
    historicalAnalogues: [
      {
        id: "a1",
        label: "2023 AI Expansion",
        similarity: 0.92,
        context:
          "Primeira onda de infra com consenso incompleto e liquidez concentrada em líderes.",
        whatHappenedNext:
          "A rotação reforçou toolchains e infra. A cauda longa performou pior após a fase inicial.",
      },
      {
        id: "a2",
        label: "Mar/2024 Liquidity Rotation",
        similarity: 0.88,
        context:
          "Memes perderam tração e o mercado reprecificou narrativas de produtividade.",
        whatHappenedNext:
          "Infra sustentou performance por semanas até choque de volatilidade.",
      },
    ],
    evidence: [
      {
        id: "e1",
        hypothesisId: "214",
        sourceType: "historical",
        sourceName: "Analogues: 2023 AI Expansion",
        confidence: 0.82,
        impactScore: 0.78,
        reasoning:
          "Padrão de rotação e aceleração de volume semelhante ao início de ciclos de infraestrutura.",
      },
      {
        id: "e2",
        hypothesisId: "214",
        sourceType: "narrative",
        sourceName: "Narrative Velocity (AI)",
        confidence: 0.86,
        impactScore: 0.65,
        reasoning:
          "Velocidade sustentada com baixa dispersão tende a preceder repricing em infra.",
      },
      {
        id: "e3",
        hypothesisId: "214",
        sourceType: "sentiment",
        sourceName: "News momentum",
        confidence: 0.74,
        impactScore: 0.58,
        reasoning:
          "Resumo de notícias indica mudança de framing para infraestrutura e produtividade.",
      },
      {
        id: "e4",
        hypothesisId: "214",
        sourceType: "technicals",
        sourceName: "Volume expansion (leaders)",
        confidence: 0.70,
        impactScore: 0.52,
        reasoning:
          "Volume concentra e se expande em nomes líderes, sugerindo demanda real em vez de dispersão.",
      },
      {
        id: "e5",
        hypothesisId: "214",
        sourceType: "news",
        sourceName: "Infra stacks renewed interest",
        confidence: 0.66,
        impactScore: 0.44,
        reasoning:
          "Notícias reforçam continuidade do tema, mas precisam ser confirmadas por métricas de uso.",
      },
    ],
  },
  {
    id: "215",
    origin: "mock",
    title: "RWA Narrative Acceleration",
    description:
      "RWA ganha força com manchetes de clareza regulatória; assimetria está em projetos com distribuição e casos de uso reais.",
    confidence: 78,
    riskScore: 38,
    expectedHorizon: "60–90 Days",
    status: "open",
    marketRegime: "Narrative Driven",
    relatedNarratives: ["RWA"],
    relatedAssets: ["ETH"],
    evidenceCount: 7,
    whyNow:
      "Força de narrativa sobe com baixa fricção de notícias. O risco é sobre-extensão sem volume sustentado.",
    invalidatingConditions: [
      "Headline reversa de regulação",
      "Queda de força/velocidade após pico de notícias",
    ],
    narrativeSignals: [
      {
        name: "RWA",
        strength: 64,
        velocity: 58,
        growth: 52,
        rotationScore: 49,
        interpretation:
          "Narrativa em aceleração, mas exige confirmação de volume e continuidade de headlines.",
      },
    ],
    historicalAnalogues: [
      {
        id: "a3",
        label: "Ciclos anteriores de headlines",
        similarity: 0.81,
        context:
          "Narrativas impulsionadas por notícias podem reverter rápido se não houver fundamento de adoção.",
        whatHappenedNext:
          "Após o pico, o mercado seleciona vencedores; a cauda longa tende a retrair.",
      },
    ],
    evidence: [
      {
        id: "e6",
        hypothesisId: "215",
        sourceType: "news",
        sourceName: "Regulatory clarity headlines",
        confidence: 0.72,
        impactScore: 0.62,
        reasoning:
          "Notícias aumentam o mindshare. Precisam ser filtradas por qualidade/execução.",
      },
      {
        id: "e7",
        hypothesisId: "215",
        sourceType: "narrative",
        sourceName: "RWA velocity + growth",
        confidence: 0.69,
        impactScore: 0.51,
        reasoning:
          "Crescimento consistente sugere transição de ‘tema’ para ‘trade’ — ainda frágil.",
      },
    ],
  },
  {
    id: "216",
    origin: "mock",
    title: "Liquidity Rotation: L2 → Infra",
    description:
      "A rotação sai de beta para infra. O foco é capturar continuidade com controle de risco em drawdowns.",
    confidence: 83,
    riskScore: 41,
    expectedHorizon: "30–60 Days",
    status: "watch",
    marketRegime: "Liquidity Rotation",
    relatedNarratives: ["Infrastructure", "Layer 2"],
    relatedAssets: ["ETH", "SOL"],
    evidenceCount: 6,
    whyNow:
      "A dispersão reduz e o mercado tende a premiar ‘qualidade’ após fases de excesso.",
    invalidatingConditions: ["Reversão abrupta para alta beta", "Queda de volume em infra"],
    narrativeSignals: [
      {
        name: "Infrastructure",
        strength: 74,
        velocity: 60,
        growth: 54,
        rotationScore: 61,
        interpretation:
          "Infra se beneficia da rotação. Exige timing: entrar tarde aumenta risco.",
      },
      {
        name: "Layer 2",
        strength: 55,
        velocity: 49,
        growth: 44,
        rotationScore: 46,
        interpretation:
          "L2 perde prioridade relativa. Pode voltar em ondas de liquidez, mas agora é secundário.",
      },
    ],
    historicalAnalogues: [
      {
        id: "a4",
        label: "Rotação pós-excesso",
        similarity: 0.76,
        context:
          "Após ciclos de beta, o capital migra para narrativas com ‘uso’ e receita percebida.",
        whatHappenedNext:
          "O movimento tende a durar até o próximo pico de euforia/volatilidade.",
      },
    ],
    evidence: [
      {
        id: "e8",
        hypothesisId: "216",
        sourceType: "narrative",
        sourceName: "Rotation signals",
        confidence: 0.73,
        impactScore: 0.56,
        reasoning:
          "Fluxo sai de narrativas saturadas e se concentra em infra, típico de rotação de qualidade.",
      },
    ],
  },
]

