import type { MarketSnapshot } from "@/services/marketMemory/types"
import type { HypothesisDetail } from "@/services/hypotheses/types"

export type AlphaScoreBreakdown = {
  narrativeStrength: number
  historicalSimilarity: number
  sentimentAlignment: number
  technicalConfirmation: number
  volumeConfirmation: number
}

export type AlphaScoreResult = {
  score: number
  breakdown: AlphaScoreBreakdown
  history: Array<{ label: string; score: number }>
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export function buildAlphaScore(
  hypothesis: HypothesisDetail,
  snapshot?: MarketSnapshot | null
): AlphaScoreResult {
  const narrativeStrength =
    hypothesis.narrativeSignals.length > 0
      ? clamp(
          hypothesis.narrativeSignals.reduce((acc, item) => acc + item.strength, 0) /
            hypothesis.narrativeSignals.length
        )
      : clamp(hypothesis.confidence * 0.82)

  const historicalSimilarity =
    hypothesis.historicalAnalogues.length > 0
      ? clamp(
          hypothesis.historicalAnalogues.reduce((acc, item) => acc + item.similarity * 100, 0) /
            hypothesis.historicalAnalogues.length
        )
      : 48

  const sentimentAlignment = snapshot
    ? clamp(snapshot.marketPulse.sentimentScore * 100 * 0.55 + snapshot.marketPulse.fearGreed * 0.45)
    : clamp(hypothesis.confidence * 0.72)

  const technicalEvidence = hypothesis.evidence.filter((item) => item.sourceType === "technicals")
  const technicalConfirmation =
    technicalEvidence.length > 0
      ? clamp(
          technicalEvidence.reduce((acc, item) => acc + item.confidence * 100, 0) /
            technicalEvidence.length
        )
      : clamp(55 + hypothesis.confidence * 0.22 - hypothesis.riskScore * 0.18)

  const volumeConfirmation = snapshot
    ? clamp(
        Math.min(
          100,
          snapshot.marketPulse.newsMomentum * 35 +
            snapshot.marketPulse.sentimentScore * 25 +
            Math.log10(Math.max(snapshot.marketPulse.volume24hUsd, 1)) * 8
        )
      )
    : clamp(58 + hypothesis.evidenceCount * 2.4)

  const score = clamp(
    narrativeStrength * 0.24 +
      historicalSimilarity * 0.2 +
      sentimentAlignment * 0.16 +
      technicalConfirmation * 0.2 +
      volumeConfirmation * 0.2
  )

  return {
    score,
    breakdown: {
      narrativeStrength,
      historicalSimilarity,
      sentimentAlignment,
      technicalConfirmation,
      volumeConfirmation,
    },
    history: [
      { label: "-90d", score: clamp(score - 11) },
      { label: "-60d", score: clamp(score - 6) },
      { label: "-30d", score: clamp(score - 2) },
      { label: "Now", score },
    ],
  }
}
