export type HypothesisStatus = "open" | "watch" | "closed"

export type Hypothesis = {
  id: string
  title: string
  description: string
  confidence: number
  riskScore: number
  expectedHorizon: string
  status: HypothesisStatus
  marketRegime: string
  relatedNarratives: string[]
  relatedAssets: string[]
  evidenceCount: number
  whyNow: string
  invalidatingConditions: string[]
  origin?: "mock" | "generated"
}

export type EvidenceItem = {
  id: string
  hypothesisId: string
  sourceType: "historical" | "narrative" | "technicals" | "sentiment" | "news"
  sourceName: string
  confidence: number
  impactScore: number
  reasoning: string
}

export type HistoricalAnalogue = {
  id: string
  label: string
  similarity: number
  context: string
  whatHappenedNext: string
}

export type NarrativeSignal = {
  name: string
  strength: number
  velocity: number
  growth: number
  rotationScore: number
  interpretation: string
}

export type HypothesisDetail = Hypothesis & {
  evidence: EvidenceItem[]
  narrativeSignals: NarrativeSignal[]
  historicalAnalogues: HistoricalAnalogue[]
}

