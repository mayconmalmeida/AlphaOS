import type { AlphaScoreResult } from "@/services/alphaScoreService"
import type { CategoryMetric, Quote, TechnicalSummary } from "@/services/cmc/types"
import type { Hypothesis, HypothesisDetail } from "@/services/hypotheses"

export type MarketConvictionBreakdown = {
  narrative_momentum: number
  category_rotation: number
  technical_confirmation: number
  sentiment_alignment: number
  market_context: number
}

export type OpportunityIntelligence = {
  opportunity_id: string
  title: string
  narrative: string
  narrative_explanation: string
  conviction_score: number
  market_conviction_breakdown: MarketConvictionBreakdown
  narrative_momentum: string
  capital_rotation: string
  potential_beneficiaries: string[]
  why_these_assets: string[]
  risk_factors: string[]
  invalidating_conditions: string[]
  coinmarketcap_inputs_used: Array<
    "Quotes" | "Categories" | "Narratives" | "Technicals" | "Sentiment" | "News"
  >
}

type OpportunityPreset = {
  narrative: string
  aliases: string[]
  explanation: string
  beneficiaries: string[]
  whyTheseAssets: string[]
  riskFactors: string[]
  invalidatingConditions: string[]
  baseConviction: number
  baseMomentum: number
  baseRotation: number
}

type OpportunitySource = Pick<
  Hypothesis,
  | "id"
  | "title"
  | "description"
  | "confidence"
  | "riskScore"
  | "marketRegime"
  | "relatedNarratives"
  | "relatedAssets"
  | "whyNow"
  | "invalidatingConditions"
> &
  Partial<Pick<Hypothesis, "expectedHorizon" | "status" | "evidenceCount">> &
  Partial<Pick<HypothesisDetail, "narrativeSignals" | "evidence" | "historicalAnalogues">>

type BuildOptions = {
  alphaScore?: AlphaScoreResult | null
  quotes?: Quote[]
  categories?: CategoryMetric[]
  technicals?: TechnicalSummary[]
}

const COINMARKETCAP_INPUTS_USED: OpportunityIntelligence["coinmarketcap_inputs_used"] = [
  "Quotes",
  "Categories",
  "Narratives",
  "Technicals",
  "Sentiment",
  "News",
]

const OPPORTUNITY_PRESETS: OpportunityPreset[] = [
  {
    narrative: "AI Infrastructure",
    aliases: ["ai infrastructure", "ai", "infrastructure", "compute", "gpu"],
    explanation:
      "Projects related to compute, AI infrastructure, GPU networks, decentralized inference, and machine intelligence infrastructure.",
    beneficiaries: ["RNDR", "TAO", "AKT", "FET"],
    whyTheseAssets: [
      "Direct exposure to decentralized compute and inference demand.",
      "High sensitivity to AI infrastructure expansion and capacity pricing.",
      "Clear narrative exposure to GPU, middleware, and machine intelligence workflows.",
    ],
    riskFactors: [
      "Narrative fatigue",
      "Liquidity contraction",
      "Compute demand repricing",
      "Valuation compression",
    ],
    invalidatingConditions: [
      "Narrative momentum drops below 60",
      "Volume expansion disappears",
      "BTC dominance rises sharply",
    ],
    baseConviction: 87,
    baseMomentum: 88,
    baseRotation: 84,
  },
  {
    narrative: "RWA",
    aliases: ["rwa", "real world asset", "tokenization", "treasury", "credit"],
    explanation:
      "Projects related to tokenization of real-world assets such as treasuries, credit, private markets, and institutional finance.",
    beneficiaries: ["ONDO", "CFG", "POLYX"],
    whyTheseAssets: [
      "Direct narrative exposure to tokenization and institutional distribution rails.",
      "Beneficiaries of expanding onchain treasury and credit adoption.",
      "Positioned around regulated market structure and real-world collateral flows.",
    ],
    riskFactors: [
      "Regulatory uncertainty",
      "Tokenization adoption slower than expected",
      "Institutional flow reversal",
    ],
    invalidatingConditions: [
      "Regulatory momentum reverses",
      "Institutional participation slows materially",
      "Category rotation falls below 55",
    ],
    baseConviction: 79,
    baseMomentum: 76,
    baseRotation: 74,
  },
  {
    narrative: "DePIN",
    aliases: ["depin", "storage", "wireless", "hardware", "physical infrastructure"],
    explanation:
      "Projects related to decentralized physical infrastructure such as compute, wireless, storage, sensors, and distributed hardware networks.",
    beneficiaries: ["HNT", "IOTX", "FIL", "AKT"],
    whyTheseAssets: [
      "Direct exposure to decentralized infrastructure adoption and utilization growth.",
      "Participation in storage, wireless, and distributed hardware demand.",
      "Narrative leverage to physical-network monetization and supply-side expansion.",
    ],
    riskFactors: [
      "Hardware adoption friction",
      "Supply-side participation decline",
      "Network utilization below expectations",
    ],
    invalidatingConditions: [
      "Usage growth stalls",
      "Network participation declines",
      "Category rotation fails to improve",
    ],
    baseConviction: 74,
    baseMomentum: 72,
    baseRotation: 70,
  },
  {
    narrative: "Layer 2",
    aliases: ["layer 2", "l2", "rollup", "scaling"],
    explanation:
      "Projects related to execution scaling, rollup ecosystems, and transaction efficiency across onchain applications.",
    beneficiaries: ["ARB", "OP", "MNT", "STRK"],
    whyTheseAssets: [
      "Direct exposure to onchain scaling and transaction throughput demand.",
      "Beneficiaries of ecosystem growth, user activity, and liquidity depth.",
      "Narrative sensitivity to lower-cost execution and developer adoption.",
    ],
    riskFactors: [
      "Sequencer economics repricing",
      "User activity fragmentation",
      "Fee compression across competing networks",
    ],
    invalidatingConditions: [
      "Activity concentration shifts away from rollups",
      "Relative strength deteriorates across leaders",
      "Capital rotation remains weak for scaling narratives",
    ],
    baseConviction: 69,
    baseMomentum: 67,
    baseRotation: 66,
  },
  {
    narrative: "Gaming",
    aliases: ["gaming", "gamefi", "games", "metaverse"],
    explanation:
      "Projects related to gaming infrastructure, game economies, digital ownership, and interactive onchain ecosystems.",
    beneficiaries: ["IMX", "RON", "GALA", "PIXEL"],
    whyTheseAssets: [
      "Direct narrative exposure to gaming user growth and ecosystem engagement.",
      "Sensitivity to distribution, content cycles, and player monetization.",
      "Clear leverage to digital ownership and gaming-specific network activity.",
    ],
    riskFactors: [
      "User retention weakness",
      "Content cycle delays",
      "Speculative interest fading faster than adoption",
    ],
    invalidatingConditions: [
      "User activity remains flat",
      "Narrative attention fades below 50",
      "Risk appetite contracts across consumer themes",
    ],
    baseConviction: 64,
    baseMomentum: 62,
    baseRotation: 60,
  },
]

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function labelForMomentum(score: number) {
  if (score >= 85) return "Accelerating"
  if (score >= 72) return "Strengthening"
  if (score >= 60) return "Building"
  if (score >= 48) return "Selective"
  return "Cooling"
}

function labelForRotation(score: number) {
  if (score >= 85) return "Strong inflow"
  if (score >= 72) return "Constructive inflow"
  if (score >= 60) return "Selective inflow"
  if (score >= 48) return "Balanced rotation"
  return "Flow cooling"
}

function normalizeSource(source: OpportunitySource): HypothesisDetail {
  return {
    ...source,
    expectedHorizon: source.expectedHorizon ?? "30–90 Days",
    status: source.status ?? "watch",
    narrativeSignals: source.narrativeSignals ?? [],
    evidence: source.evidence ?? [],
    historicalAnalogues: source.historicalAnalogues ?? [],
    evidenceCount:
      typeof source.evidenceCount === "number"
        ? source.evidenceCount
        : source.evidence?.length ?? 0,
  }
}

function matchPreset(text: string) {
  const haystack = text.toLowerCase()
  return OPPORTUNITY_PRESETS.find((preset) =>
    preset.aliases.some((alias) => haystack.includes(alias))
  )
}

function resolvePreset(source: OpportunitySource) {
  const joined = [
    source.title,
    source.description,
    source.whyNow,
    ...(source.relatedNarratives ?? []),
  ]
    .filter(Boolean)
    .join(" ")

  return (
    matchPreset(joined) ??
    matchPreset(source.relatedNarratives?.[0] ?? "") ??
    OPPORTUNITY_PRESETS[0]
  )
}

function categoryRotationScore(
  preset: OpportunityPreset,
  source: HypothesisDetail,
  categories: CategoryMetric[]
) {
  const matched = categories.filter((item) =>
    preset.aliases.some((alias) => item.name.toLowerCase().includes(alias))
  )

  if (matched.length > 0) {
    return clamp(
      matched.reduce((acc, item) => acc + item.rotationScore, 0) / matched.length
    )
  }

  if (categories.length > 0) {
    return clamp(
      categories
        .slice()
        .sort((a, b) => b.rotationScore - a.rotationScore)
        .slice(0, 3)
        .reduce((acc, item) => acc + item.rotationScore, 0) / Math.min(3, categories.length)
    )
  }

  if (source.narrativeSignals.length > 0) {
    return clamp(
      source.narrativeSignals.reduce((acc, item) => acc + item.rotationScore, 0) /
        source.narrativeSignals.length
    )
  }

  return preset.baseRotation
}

function technicalConfirmationScore(
  source: HypothesisDetail,
  technicals: TechnicalSummary[],
  alphaScore?: AlphaScoreResult | null
) {
  if (technicals.length > 0) {
    const score =
      technicals.reduce((acc, item) => {
        const trendBase =
          item.trend === "bullish" ? 82 : item.trend === "neutral" ? 62 : 38
        return acc + trendBase * 0.6 + item.momentum * 100 * 0.4
      }, 0) / technicals.length
    return clamp(score)
  }

  if (alphaScore) return clamp(alphaScore.breakdown.technicalConfirmation)

  return clamp(55 + source.confidence * 0.28 - source.riskScore * 0.22)
}

function narrativeMomentumScore(
  preset: OpportunityPreset,
  source: HypothesisDetail,
  alphaScore?: AlphaScoreResult | null
) {
  if (source.narrativeSignals.length > 0) {
    const score =
      source.narrativeSignals.reduce(
        (acc, item) => acc + item.velocity * 0.45 + item.growth * 0.25 + item.strength * 0.3,
        0
      ) / source.narrativeSignals.length
    return clamp(score)
  }

  if (alphaScore) return clamp(alphaScore.breakdown.narrativeStrength * 0.8 + source.confidence * 0.2)

  return preset.baseMomentum
}

function sentimentAlignmentScore(
  source: HypothesisDetail,
  alphaScore?: AlphaScoreResult | null
) {
  if (alphaScore) return clamp(alphaScore.breakdown.sentimentAlignment)
  return clamp(source.confidence * 0.72 + (100 - source.riskScore) * 0.18 + 12)
}

function marketContextScore(
  source: HypothesisDetail,
  quotes: Quote[],
  alphaScore?: AlphaScoreResult | null
) {
  const quoteQuality =
    quotes.length > 0
      ? clamp(
          quotes.reduce((acc, item) => {
            const size = Math.log10(Math.max(item.marketCapUsd, 1))
            const flow = Math.log10(Math.max(item.volume24hUsd, 1))
            return acc + Math.min(100, size * 8 + flow * 12)
          }, 0) / quotes.length
        )
      : 68

  const base = alphaScore?.breakdown.volumeConfirmation ?? clamp(source.confidence * 0.7)
  return clamp(base * 0.45 + quoteQuality * 0.25 + (100 - source.riskScore) * 0.3)
}

function buildBeneficiaries(preset: OpportunityPreset, source: HypothesisDetail) {
  const userAssets = (source.relatedAssets ?? []).filter(
    (asset) => !["BTC", "ETH", "SOL"].includes(asset.toUpperCase())
  )
  return Array.from(new Set([...userAssets, ...preset.beneficiaries])).slice(0, 4)
}

export function buildOpportunityIntelligence(
  sourceInput: OpportunitySource,
  options: BuildOptions = {}
): OpportunityIntelligence {
  const source = normalizeSource(sourceInput)
  const preset = resolvePreset(source)
  const alphaScore = options.alphaScore ?? null
  const quotes = options.quotes ?? []
  const categories = options.categories ?? []
  const technicals = options.technicals ?? []

  const breakdown: MarketConvictionBreakdown = {
    narrative_momentum: narrativeMomentumScore(preset, source, alphaScore),
    category_rotation: categoryRotationScore(preset, source, categories),
    technical_confirmation: technicalConfirmationScore(source, technicals, alphaScore),
    sentiment_alignment: sentimentAlignmentScore(source, alphaScore),
    market_context: marketContextScore(source, quotes, alphaScore),
  }

  const conviction = clamp(
    breakdown.narrative_momentum * 0.24 +
      breakdown.category_rotation * 0.2 +
      breakdown.technical_confirmation * 0.2 +
      breakdown.sentiment_alignment * 0.16 +
      breakdown.market_context * 0.2
  )

  return {
    opportunity_id: source.id,
    title: preset.narrative,
    narrative: preset.narrative,
    narrative_explanation: preset.explanation,
    conviction_score: conviction,
    market_conviction_breakdown: breakdown,
    narrative_momentum: labelForMomentum(breakdown.narrative_momentum),
    capital_rotation: labelForRotation(breakdown.category_rotation),
    potential_beneficiaries: buildBeneficiaries(preset, source),
    why_these_assets: preset.whyTheseAssets,
    risk_factors: Array.from(new Set([...preset.riskFactors, ...source.invalidatingConditions])).slice(
      0,
      4
    ),
    invalidating_conditions:
      source.invalidatingConditions.length > 0
        ? source.invalidatingConditions
        : preset.invalidatingConditions,
    coinmarketcap_inputs_used: COINMARKETCAP_INPUTS_USED,
  }
}

export function buildOpportunityRadar(
  hypotheses: Hypothesis[],
  options: BuildOptions = {}
) {
  return OPPORTUNITY_PRESETS.map((preset, index) => {
    const matched =
      hypotheses.find((item) => resolvePreset(item).narrative === preset.narrative) ?? {
        id: `opportunity-${index + 1}`,
        title: preset.narrative,
        description: preset.explanation,
        confidence: preset.baseConviction,
        riskScore: clamp(100 - preset.baseConviction),
        marketRegime: "Narrative Rotation",
        relatedNarratives: [preset.narrative],
        relatedAssets: preset.beneficiaries,
        evidenceCount: 0,
        whyNow: `${preset.narrative} remains one of the clearest areas of narrative exposure in the current market rotation.`,
        invalidatingConditions: preset.invalidatingConditions,
        status: "watch" as const,
      }

    const intelligence = buildOpportunityIntelligence(matched, options)

    return {
      rank: index + 1,
      ...intelligence,
    }
  })
    .sort((a, b) => {
      if (b.conviction_score !== a.conviction_score) return b.conviction_score - a.conviction_score
      return a.rank - b.rank
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }))
}

export function buildOpportunityReportSection(model: OpportunityIntelligence) {
  return [
    `Narrative: ${model.narrative}`,
    `Market conviction: ${model.conviction_score}/100`,
    `Narrative momentum: ${model.market_conviction_breakdown.narrative_momentum}`,
    `Category rotation: ${model.market_conviction_breakdown.category_rotation}`,
    `Technical confirmation: ${model.market_conviction_breakdown.technical_confirmation}`,
    `Sentiment alignment: ${model.market_conviction_breakdown.sentiment_alignment}`,
    `Market context: ${model.market_conviction_breakdown.market_context}`,
    `Potential beneficiaries: ${model.potential_beneficiaries.join(", ")}`,
    `Why these assets: ${model.why_these_assets.join(" | ")}`,
    `Risk factors: ${model.risk_factors.join(" | ")}`,
    `Invalidating conditions: ${model.invalidating_conditions.join(" | ")}`,
    `Inputs used: ${model.coinmarketcap_inputs_used.join(", ")}`,
    "Research and simulation only. Not financial advice.",
  ].join("\n")
}
