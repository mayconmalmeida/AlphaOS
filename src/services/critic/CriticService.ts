import type { ApiResult } from "@/lib/api"
import { ok } from "@/lib/api"
import type { AiJsonSchema } from "@/services/ai"
import { aiService } from "@/services/ai"
import { criticRepository } from "@/services/critic/CriticRepository"
import type { StrategyCandidate } from "@/services/strategies"
import type { CriticCheck, CriticReport, CriticStatus } from "@/services/critic/types"

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

type CriticAiOutput = {
  overall_status: "approved" | "warning" | "rejected"
  score: number
  findings: string[]
  warnings: string[]
  failure_reasons: string[]
  recommended_adjustments: string[]
}

const criticSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overall_status",
    "score",
    "findings",
    "warnings",
    "failure_reasons",
    "recommended_adjustments",
  ],
  properties: {
    overall_status: { type: "string", enum: ["approved", "warning", "rejected"] },
    score: { type: "number" },
    findings: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
    failure_reasons: { type: "array", items: { type: "string" } },
    recommended_adjustments: { type: "array", items: { type: "string" } },
  },
} satisfies AiJsonSchema

function buildCheck(
  key: string,
  label: string,
  score: number,
  reasoning: string
): CriticCheck {
  return {
    key,
    label,
    score,
    reasoning,
    status: score >= 75 ? "passed" : score >= 55 ? "warning" : "failed",
  }
}

function buildPrompt(strategy: StrategyCandidate) {
  return [
    "Você é o AlphaOS Critic Agent (camada institucional de auditoria).",
    "Avalie a estratégia e retorne o output JSON do schema.",
    "Não execute trades reais. Isto é research e simulation only.",
    "Se faltar evidência para validar um item, reduza o score e registre warnings/failure_reasons.",
    "",
    "STRATEGY (JSON):",
    JSON.stringify(
      {
        id: strategy.id,
        hypothesis_id: strategy.hypothesisId,
        hypothesis_title: strategy.hypothesisTitle,
        pipeline_stage: strategy.pipelineStage,
        status: strategy.status,
        score: strategy.score,
        spec: strategy.spec,
        metrics: strategy.metrics,
      },
      null,
      2
    ),
  ].join("\n")
}

function buildDeterministicReport(strategy: StrategyCandidate): CriticReport {
  const overfitting = clamp(
    88 - strategy.metrics.tradeCount / 2 - strategy.metrics.totalReturn * 30,
    35,
    92
  )
  const liquidity = clamp(
    62 + strategy.spec.universe.length * 6 - strategy.metrics.maxDrawdown * 40,
    38,
    91
  )
  const narrativeDependency = clamp(90 - strategy.spec.universe.length * 5, 40, 90)
  const marketDependency = clamp(84 - strategy.metrics.maxDrawdown * 100, 36, 88)
  const drawdownRisk = clamp(92 - strategy.metrics.maxDrawdown * 220, 30, 92)
  const sampleSize = clamp(strategy.metrics.tradeCount * 1.6, 32, 92)
  const concentration = clamp(95 - strategy.spec.universe.length * 12, 28, 90)
  const ruleClarity = clamp(
    92 - (strategy.spec.entryRules.length + strategy.spec.exitRules.length) * 4,
    35,
    92
  )
  const backtestReliability = clamp(
    52 + strategy.metrics.tradeCount * 0.7 + strategy.spec.universe.length * 4,
    35,
    92
  )

  const checks: CriticCheck[] = [
    buildCheck(
      "overfitting",
      "Overfitting Risk",
      overfitting,
      "Strategies with very high returns and limited observations can hide overfitting."
    ),
    buildCheck(
      "liquidity",
      "Liquidity Risk",
      liquidity,
      "More liquid universes and controlled drawdowns improve real-world executability."
    ),
    buildCheck(
      "drawdown",
      "Drawdown Risk",
      drawdownRisk,
      "High drawdowns reduce robustness and increase operational fragility."
    ),
    buildCheck(
      "narrative",
      "Narrative Dependency",
      narrativeDependency,
      "The more concentrated the strategy is in one narrative, the greater the risk of reversal when attention shifts."
    ),
    buildCheck(
      "market",
      "Market Regime Dependency",
      marketDependency,
      "Regime dependency appears when the strategy degrades quickly outside its base scenario."
    ),
    buildCheck(
      "sample",
      "Sample Size",
      sampleSize,
      "More trades and broader time diversity reduce statistical fragility."
    ),
    buildCheck(
      "concentration",
      "Risk Concentration",
      concentration,
      "Too few assets increase concentration risk and make the thesis less resilient."
    ),
    buildCheck(
      "clarity",
      "Rule Clarity",
      ruleClarity,
      "Overly complex or ambiguous rules make consistent execution harder and create room for bias."
    ),
    buildCheck(
      "reliability",
      "Backtest Reliability",
      backtestReliability,
      "Backtests with too few trades and limited universe diversity tend to be less reliable."
    ),
  ]

  const avgScore = Math.round(
    checks.reduce((acc, item) => acc + item.score, 0) / checks.length
  )

  const overallStatus: CriticStatus =
    avgScore >= 78 ? "approved" : avgScore >= 58 ? "warning" : "rejected"

  const findings = checks
    .filter((item) => item.status === "passed")
    .map((item) => `${item.label}: ${item.reasoning}`)

  const warnings = checks
    .filter((item) => item.status === "warning")
    .map((item) => `${item.label}: review exposure and robustness.`)

  const failureReasons = checks
    .filter((item) => item.status === "failed")
    .map((item) => `${item.label}: below the institutional quality threshold.`)

  const recommendedAdjustments = [
    "Increase universe diversity to reduce concentration.",
    "Revalidate the strategy across additional market windows.",
    "Apply stronger liquidity and regime filters before final approval.",
  ]

  return {
    strategyId: strategy.id,
    overallStatus,
    score: avgScore,
    findings,
    warnings,
    failureReasons,
    recommendedAdjustments,
    checks,
  }
}

export type CriticService = {
  reviewStrategy(strategy: StrategyCandidate): Promise<ApiResult<CriticReport>>
}

export function createCriticService(): CriticService {
  return {
    async reviewStrategy(strategy) {
      const cached = await criticRepository.get(strategy.id)
      if (cached) {
        return ok(cached)
      }

      const baseline = buildDeterministicReport(strategy)
      const prompt = buildPrompt(strategy)

      const aiRes = await aiService.generate<CriticAiOutput>({
        taskType: "critic_review",
        input: prompt,
        schema: criticSchema,
        mockFallback: true,
      })

      const aiOutput =
        aiRes.ok &&
        aiRes.data.source === "edge" &&
        aiRes.data.structuredData &&
        typeof aiRes.data.structuredData.overall_status === "string"
          ? aiRes.data.structuredData
          : null

      const report: CriticReport = aiOutput
        ? {
            ...baseline,
            overallStatus: aiOutput.overall_status,
            score: Math.round(clamp(aiOutput.score, 0, 100)),
            findings: aiOutput.findings,
            warnings: aiOutput.warnings,
            failureReasons: aiOutput.failure_reasons,
            recommendedAdjustments: aiOutput.recommended_adjustments,
          }
        : baseline

      await criticRepository.upsert(report)
      return ok(report)
    },
  }
}

export const criticService = createCriticService()

