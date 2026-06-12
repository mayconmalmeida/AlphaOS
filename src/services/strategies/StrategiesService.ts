import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { AiJsonSchema } from "@/services/ai"
import { aiService } from "@/services/ai"
import { criticService } from "@/services/critic"
import { hypothesesService } from "@/services/hypotheses"
import type { HypothesisDetail } from "@/services/hypotheses"
import { mockPipeline, mockStrategyCandidates } from "@/services/strategies/mockData"
import { strategiesRepository } from "@/services/strategies/StrategiesRepository"
import type {
  PipelineStep,
  StrategyCandidate,
  StrategyComparison,
  StrategyMetrics,
  StrategySpec,
} from "@/services/strategies/types"

type StrategyGenerationSpec = {
  strategy_name: string
  objective: string
  universe: string[]
  entry_rules: string[]
  exit_rules: string[]
  position_sizing: string
  rebalance_frequency: string
  risk_controls: string[]
  stop_conditions: string[]
  benchmark: string
  time_horizon: string
}

type StrategyGenerationOutput = {
  strategies: StrategyGenerationSpec[]
}

const strategyGenerationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["strategies"],
  properties: {
    strategies: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "strategy_name",
          "objective",
          "universe",
          "entry_rules",
          "exit_rules",
          "position_sizing",
          "rebalance_frequency",
          "risk_controls",
          "stop_conditions",
          "benchmark",
          "time_horizon",
        ],
        properties: {
          strategy_name: { type: "string" },
          objective: { type: "string" },
          universe: { type: "array", items: { type: "string" } },
          entry_rules: { type: "array", items: { type: "string" } },
          exit_rules: { type: "array", items: { type: "string" } },
          position_sizing: { type: "string" },
          rebalance_frequency: { type: "string" },
          risk_controls: { type: "array", items: { type: "string" } },
          stop_conditions: { type: "array", items: { type: "string" } },
          benchmark: { type: "string" },
          time_horizon: { type: "string" },
        },
      },
    },
  },
} satisfies AiJsonSchema

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

async function getAllCandidates() {
  const generated = await strategiesRepository.listGenerated()
  return [...generated, ...mockStrategyCandidates]
}

function buildPrompt(input: {
  hypothesis: HypothesisDetail
  riskConstraints: string[]
  variationCount: number
}) {
  return [
    "Você é o AlphaOS Strategy Generation Engine.",
    "Transforme a hipótese selecionada em estratégias backtestáveis.",
    "Não execute trades reais. Isto é research e simulation only.",
    `Gere entre 10 e 50 variações. Nesta execução, gere ${input.variationCount}.`,
    "Use apenas o contexto fornecido.",
    "Responda exclusivamente no JSON do schema.",
    "",
    "INPUT (JSON):",
    JSON.stringify(
      {
        selected_hypothesis: {
          id: input.hypothesis.id,
          title: input.hypothesis.title,
          description: input.hypothesis.description,
          confidence: input.hypothesis.confidence,
          risk_score: input.hypothesis.riskScore,
          expected_horizon: input.hypothesis.expectedHorizon,
          market_regime: input.hypothesis.marketRegime,
          related_assets: input.hypothesis.relatedAssets,
          related_narratives: input.hypothesis.relatedNarratives,
          invalidating_conditions: input.hypothesis.invalidatingConditions,
          why_now: input.hypothesis.whyNow,
          evidence: input.hypothesis.evidence,
        },
        risk_constraints: input.riskConstraints,
      },
      null,
      2
    ),
  ].join("\n")
}

function buildFallbackStrategies(
  hypothesis: HypothesisDetail,
  variationCount: number
): StrategyGenerationSpec[] {
  const verbs = [
    "Momentum",
    "Rotation",
    "Breakout",
    "Regime",
    "Quality",
    "Relative Strength",
    "Narrative",
    "Conviction",
    "Volatility",
    "Liquidity",
    "Trend",
    "Overlay",
  ]
  const universes = [
    hypothesis.relatedAssets,
    hypothesis.relatedAssets.slice(0, 2),
    hypothesis.relatedAssets.concat(["BTC"]).filter((item, idx, arr) => arr.indexOf(item) === idx),
    ["BTC", "ETH", ...hypothesis.relatedAssets].filter((item, idx, arr) => arr.indexOf(item) === idx),
  ]
  const constraints = [
    "Maximum 35% exposure per asset",
    "Mandatory review if drawdown exceeds the budget",
    "No allocation outside sufficiently liquid assets",
  ]

  return Array.from({ length: variationCount }).map((_, index) => {
    const universe = universes[index % universes.length].slice(0, 4)
    const focusNarrative =
      hypothesis.relatedNarratives[index % Math.max(1, hypothesis.relatedNarratives.length)] ??
      "AI Infrastructure"
    const sizingModes = [
      "Equal-risk allocation",
      "Volatility-adjusted sizing",
      "Confidence-weighted exposure",
      "Tiered conviction sizing",
    ]
    const rebalanceModes = ["Weekly", "Every 3 days", "Twice weekly", "Event-driven"]

    return {
      strategy_name: `${verbs[index % verbs.length]} ${focusNarrative} v${index + 1}`,
      objective: `Capture the thesis "${hypothesis.title}" with disciplined risk control and testable rules.`,
      universe,
      entry_rules: [
        `Activate only if the regime remains in ${hypothesis.marketRegime}.`,
        "Require confirmation from at least two core evidence points.",
        "Enter only when narrative strength and liquidity remain intact.",
      ],
      exit_rules: [
        "Reduce exposure when the primary evidence loses relevance.",
        "Exit if an invalidating condition is triggered.",
        "Deallocate if the benchmark outperforms with lower drawdown.",
      ],
      position_sizing: sizingModes[index % sizingModes.length],
      rebalance_frequency: rebalanceModes[index % rebalanceModes.length],
      risk_controls: [
        ...constraints,
        `Risk budget aligned with risk score ${hypothesis.riskScore}.`,
      ],
      stop_conditions: hypothesis.invalidatingConditions.slice(0, 3),
      benchmark: universe.includes("BTC") ? "BTC + ETH blend" : "Equal-weight majors basket",
      time_horizon: hypothesis.expectedHorizon,
    }
  })
}

function buildMetrics(spec: StrategySpec, hypothesis: HypothesisDetail, index: number): StrategyMetrics {
  const qualityBias = hypothesis.confidence / 100
  const riskBias = hypothesis.riskScore / 100
  const diversity = clamp(spec.universe.length / 5, 0.4, 1)
  const totalReturn = clamp(0.1 + qualityBias * 0.22 + diversity * 0.1 - riskBias * 0.06 + index * 0.006, 0.08, 0.48)
  const maxDrawdown = clamp(0.05 + riskBias * 0.12 + (1 - diversity) * 0.08 + (index % 4) * 0.008, 0.04, 0.26)
  const sharpeProxy = clamp(0.9 + qualityBias * 0.9 - riskBias * 0.4 + diversity * 0.4 - (index % 3) * 0.06, 0.8, 2.4)
  const winRate = clamp(0.44 + qualityBias * 0.18 - riskBias * 0.08 + diversity * 0.05, 0.4, 0.74)
  const profitFactor = clamp(1.05 + qualityBias * 0.65 - riskBias * 0.18 + diversity * 0.22, 1.0, 2.3)
  const tradeCount = Math.round(clamp(18 + spec.entryRules.length * 5 + index * 2, 18, 72))

  return {
    totalReturn,
    maxDrawdown,
    sharpeProxy,
    winRate,
    profitFactor,
    tradeCount,
  }
}

function buildScore(metrics: StrategyMetrics) {
  return Math.round(
    metrics.totalReturn * 100 * 0.34 +
      (1 - metrics.maxDrawdown) * 100 * 0.18 +
      metrics.sharpeProxy * 18 +
      metrics.winRate * 22 +
      metrics.profitFactor * 10
  )
}

function buildCandidate(
  raw: StrategyGenerationSpec,
  hypothesis: HypothesisDetail,
  index: number
): StrategyCandidate {
  const spec: StrategySpec = {
    strategyName: raw.strategy_name,
    objective: raw.objective,
    universe: raw.universe,
    entryRules: raw.entry_rules,
    exitRules: raw.exit_rules,
    positionSizing: raw.position_sizing,
    rebalanceFrequency: raw.rebalance_frequency,
    riskControls: raw.risk_controls,
    stopConditions: raw.stop_conditions,
    benchmark: raw.benchmark,
    timeHorizon: raw.time_horizon,
  }
  const metrics = buildMetrics(spec, hypothesis, index)
  const score = buildScore(metrics)

  return {
    id: createId(),
    hypothesisId: hypothesis.id,
    hypothesisTitle: hypothesis.title,
    score,
    origin: "generated",
    status: "candidate",
    pipelineStage: "generate",
    spec,
    metrics,
  }
}

function buildPipeline(candidates: StrategyCandidate[], hypothesisCount: number): PipelineStep[] {
  if (candidates.length === 0) {
    return [
      { label: "Hypothesis", status: hypothesisCount > 0 ? "ready" : "mock", count: hypothesisCount },
      { label: "Generate", status: "active", count: 0 },
      { label: "Backtest", status: "mock", count: 0 },
      { label: "Critic", status: "mock", count: 0 },
      { label: "Approved", status: "mock", count: 0 },
    ]
  }

  return [
    { label: "Hypothesis", status: "ready", count: hypothesisCount },
    { label: "Generate", status: "active", count: candidates.length },
    {
      label: "Backtest",
      status: "mock",
      count: candidates.filter((item) => ["backtest", "critic", "approved"].includes(item.pipelineStage)).length,
    },
    {
      label: "Critic",
      status: "active",
      count: candidates.filter((item) => ["critic", "approved"].includes(item.pipelineStage)).length,
    },
    {
      label: "Approved",
      status: "ready",
      count: candidates.filter((item) => item.status === "approved").length,
    },
  ]
}

export type StrategiesService = {
  getPipeline(query?: { hypothesisId?: string; hypothesisCount?: number }): Promise<ApiResult<PipelineStep[]>>
  listCandidates(query?: {
    search?: string
    status?: string
    hypothesisId?: string
  }): Promise<ApiResult<StrategyCandidate[]>>
  compare(ids: [string, string]): Promise<ApiResult<StrategyComparison>>
  generateFromHypothesis(input: {
    hypothesisId: string
    riskConstraints?: string[]
    variationCount?: number
  }): Promise<ApiResult<StrategyCandidate[]>>
}

export function createStrategiesService(): StrategiesService {
  return {
    async getPipeline(query) {
      const all = await getAllCandidates()
      const candidates = query?.hypothesisId
        ? all.filter((item) => item.hypothesisId === query.hypothesisId)
        : all

      if (!query?.hypothesisId && candidates.length === mockStrategyCandidates.length) {
        return ok(mockPipeline)
      }

      return ok(buildPipeline(candidates, query?.hypothesisCount ?? 1))
    },

    async listCandidates(query) {
      const search = query?.search?.trim().toLowerCase()
      const status = query?.status?.trim().toLowerCase()

      const filtered = (await getAllCandidates())
        .filter((item) => {
          if (query?.hypothesisId && item.hypothesisId !== query.hypothesisId) return false
          return true
        })
        .filter((item) => {
          if (status && status !== "all" && item.status !== status) return false
          if (!search) return true
          const haystack = [
            item.hypothesisTitle,
            item.spec.strategyName,
            item.spec.objective,
            item.spec.benchmark,
            ...item.spec.universe,
          ]
            .join(" ")
            .toLowerCase()
          return haystack.includes(search)
        })
        .slice()
        .sort((a, b) => b.score - a.score)

      return ok(filtered)
    },

    async compare(ids) {
      const all = await getAllCandidates()
      const left = all.find((item) => item.id === ids[0])
      const right = all.find((item) => item.id === ids[1])
      if (!left || !right) return err("Strategy not found", "STRATEGY_NOT_FOUND")
      return ok({ left, right })
    },

    async generateFromHypothesis(input) {
      const variationCount = clamp(Math.round(input.variationCount ?? 12), 10, 50)
      const hypothesisRes = await hypothesesService.getById(input.hypothesisId)
      if (hypothesisRes.ok === false) {
        return err(hypothesisRes.error.message, hypothesisRes.error.code)
      }

      const hypothesis = hypothesisRes.data
      const riskConstraints = input.riskConstraints ?? [
        "Do not execute live trades",
        "Keep drawdown inside the hypothesis risk budget",
        "Apply liquidity and regime filters",
      ]

      const prompt = buildPrompt({
        hypothesis,
        riskConstraints,
        variationCount,
      })

      const aiRes = await aiService.generate<StrategyGenerationOutput>({
        taskType: "strategy_generation",
        input: prompt,
        schema: strategyGenerationSchema,
        mockFallback: true,
      })

      const fallbackStrategies = buildFallbackStrategies(hypothesis, variationCount)
      const rawStrategies =
        aiRes.ok &&
        aiRes.data.source === "edge" &&
        aiRes.data.structuredData &&
        Array.isArray(aiRes.data.structuredData.strategies) &&
        aiRes.data.structuredData.strategies.length > 0
          ? aiRes.data.structuredData.strategies.slice(0, variationCount)
          : fallbackStrategies

      const baseCandidates = rawStrategies.map((raw, index) =>
        buildCandidate(raw, hypothesis, index)
      )

      const reviewed = await Promise.all(
        baseCandidates.map(async (candidate) => {
          const criticRes = await criticService.reviewStrategy(candidate)
          const criticScore = criticRes.ok ? criticRes.data.score : 0
          const finalScore = Math.round(candidate.score * 0.62 + criticScore * 0.38)

          const overall = criticRes.ok ? criticRes.data.overallStatus : "warning"
          const status =
            overall === "approved"
              ? "approved"
              : overall === "warning"
                ? "warning"
                : "candidate"

          const pipelineStage =
            overall === "approved"
              ? "approved"
              : "critic"

          return {
            ...candidate,
            score: finalScore,
            status,
            pipelineStage,
          } satisfies StrategyCandidate
        })
      )

      const candidates = reviewed.slice().sort((a, b) => b.score - a.score)

      await strategiesRepository.replaceForHypothesis(hypothesis.id, candidates)
      return ok(candidates)
    },
  }
}

export const strategiesService = createStrategiesService()

