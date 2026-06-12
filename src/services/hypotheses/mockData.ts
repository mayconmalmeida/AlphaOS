import type { HypothesisDetail } from "@/services/hypotheses/types"

export const mockHypotheses: HypothesisDetail[] = [
  {
    id: "214",
    origin: "mock",
    title: "AI Infrastructure Expansion",
    description:
      "The asymmetry sits in AI infrastructure: demand for compute, toolchains, and middleware is accelerating while the market still prices it as narrative-only.",
    confidence: 91,
    riskScore: 34,
    expectedHorizon: "45 Days",
    status: "open",
    marketRegime: "Bull Expansion",
    relatedNarratives: ["AI", "Infrastructure"],
    relatedAssets: ["BTC", "ETH", "SOL"],
    evidenceCount: 9,
    whyNow:
      "Narrative velocity remains high, dispersion is contained, and capital is rotating toward quality. The market is still early in framing infrastructure as productivity rather than hype.",
    invalidatingConditions: [
      "Abrupt volatility expansion with sustained volume deterioration",
      "Narrative dispersion back into high beta without infrastructure confirmation",
      "Negative adoption or usage metrics from leading names",
    ],
    narrativeSignals: [
      {
        name: "AI",
        strength: 86,
        velocity: 72,
        growth: 61,
        rotationScore: 68,
        interpretation:
          "Dominant narrative with stable acceleration. Supports continuation if volume remains intact.",
      },
      {
        name: "Infrastructure",
        strength: 74,
        velocity: 60,
        growth: 54,
        rotationScore: 61,
        interpretation:
          "Rotation into infrastructure suggests a search for quality after high-beta saturation.",
      },
    ],
    historicalAnalogues: [
      {
        id: "a1",
        label: "2023 AI Expansion",
        similarity: 0.92,
        context:
          "First infrastructure wave with incomplete consensus and liquidity concentrated in category leaders.",
        whatHappenedNext:
          "Rotation reinforced toolchains and infrastructure while the long tail underperformed after the initial phase.",
      },
      {
        id: "a2",
        label: "Mar/2024 Liquidity Rotation",
        similarity: 0.88,
        context:
          "Memecoins lost traction and the market repriced productivity narratives.",
        whatHappenedNext:
          "Infrastructure sustained leadership for weeks until volatility shocked the regime.",
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
          "Rotation and volume acceleration closely resemble the early phase of prior infrastructure cycles.",
      },
      {
        id: "e2",
        hypothesisId: "214",
        sourceType: "narrative",
        sourceName: "Narrative Velocity (AI)",
        confidence: 0.86,
        impactScore: 0.65,
        reasoning:
          "Sustained velocity with low dispersion tends to precede repricing in infrastructure leaders.",
      },
      {
        id: "e3",
        hypothesisId: "214",
        sourceType: "sentiment",
        sourceName: "News momentum",
        confidence: 0.74,
        impactScore: 0.58,
        reasoning:
          "News flow suggests a clear framing shift toward infrastructure and productivity.",
      },
      {
        id: "e4",
        hypothesisId: "214",
        sourceType: "technicals",
        sourceName: "Volume expansion (leaders)",
        confidence: 0.70,
        impactScore: 0.52,
        reasoning:
          "Volume is concentrating and expanding in leaders, suggesting real demand rather than indiscriminate speculation.",
      },
      {
        id: "e5",
        hypothesisId: "214",
        sourceType: "news",
        sourceName: "Infra stacks renewed interest",
        confidence: 0.66,
        impactScore: 0.44,
        reasoning:
          "News flow supports thematic continuity, but still needs confirmation from usage metrics.",
      },
    ],
  },
  {
    id: "215",
    origin: "mock",
    title: "RWA Narrative Acceleration",
    description:
      "RWA is gaining momentum through regulatory clarity headlines; the asymmetry sits in projects with real distribution and practical use cases.",
    confidence: 78,
    riskScore: 38,
    expectedHorizon: "60–90 Days",
    status: "open",
    marketRegime: "Narrative Driven",
    relatedNarratives: ["RWA"],
    relatedAssets: ["ETH"],
    evidenceCount: 7,
    whyNow:
      "Narrative strength is rising with low headline friction. The main risk is overextension without sustained volume.",
    invalidatingConditions: [
      "A negative regulatory headline reversal",
      "A sharp drop in strength or velocity after the news peak",
    ],
    narrativeSignals: [
      {
        name: "RWA",
        strength: 64,
        velocity: 58,
        growth: 52,
        rotationScore: 49,
        interpretation:
          "The narrative is accelerating, but still needs confirmation from volume and continued headlines.",
      },
    ],
    historicalAnalogues: [
      {
        id: "a3",
        label: "Ciclos anteriores de headlines",
        similarity: 0.81,
        context:
          "Headline-driven narratives can reverse quickly when adoption fundamentals are missing.",
        whatHappenedNext:
          "After the peak, the market usually selects a few winners while the long tail contracts.",
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
          "Headlines are increasing mindshare, but still need to be filtered through execution quality.",
      },
      {
        id: "e7",
        hypothesisId: "215",
        sourceType: "narrative",
        sourceName: "RWA velocity + growth",
        confidence: 0.69,
        impactScore: 0.51,
        reasoning:
          "Consistent growth suggests a shift from theme to trade, but the setup remains fragile.",
      },
    ],
  },
  {
    id: "216",
    origin: "mock",
    title: "Liquidity Rotation: L2 → Infra",
    description:
      "Liquidity is rotating out of beta and into infrastructure. The goal is to capture continuation while keeping drawdowns controlled.",
    confidence: 83,
    riskScore: 41,
    expectedHorizon: "30–60 Days",
    status: "watch",
    marketRegime: "Liquidity Rotation",
    relatedNarratives: ["Infrastructure", "Layer 2"],
    relatedAssets: ["ETH", "SOL"],
    evidenceCount: 6,
    whyNow:
      "Dispersion is tightening and the market is starting to reward quality after an extended excess phase.",
    invalidatingConditions: ["Abrupt reversal back into high beta", "Volume deterioration across infrastructure leaders"],
    narrativeSignals: [
      {
        name: "Infrastructure",
        strength: 74,
        velocity: 60,
        growth: 54,
        rotationScore: 61,
        interpretation:
          "Infrastructure is benefiting from the rotation, but late entry materially increases risk.",
      },
      {
        name: "Layer 2",
        strength: 55,
        velocity: 49,
        growth: 44,
        rotationScore: 46,
        interpretation:
          "Layer 2 is losing relative priority. It can recover in later liquidity waves, but it is secondary for now.",
      },
    ],
    historicalAnalogues: [
      {
        id: "a4",
        label: "Post-excess rotation",
        similarity: 0.76,
        context:
          "After high-beta cycles, capital often migrates toward narratives tied to usage and perceived revenue quality.",
        whatHappenedNext:
          "The move usually lasts until the next volatility or euphoria spike resets the regime.",
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
          "Flow is leaving saturated narratives and concentrating in infrastructure, which is typical of quality rotation.",
      },
    ],
  },
]

