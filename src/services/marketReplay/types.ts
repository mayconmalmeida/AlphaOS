export type ReplayEvent = {
  id: string
  day: number
  timestampLabel: string
  title: string
  description: string
  impact: "low" | "medium" | "high"
  category: "narrative" | "rotation" | "sentiment" | "macro" | "volume"
}

export type ReplayFrame = {
  day: number
  timestampLabel: string
  narrativeLeader: string
  narrativeStrength: number
  sentiment: number
  marketBreadth: number
  volumeTrend: string
  rotation: string
  notableAssets: string[]
}

export type ReplayOutcome = {
  label: string
  value: string
  tone: "positive" | "neutral" | "negative"
}

export type ReplayFollowThrough = {
  horizon: "30d" | "60d" | "90d"
  whatHappenedNext: string
  marketEvolution: string
  winningNarratives: string[]
  losingNarratives: string[]
}

export type ReplayScenario = {
  id: string
  title: string
  dateRange: string
  durationDays: number
  thesis: string
  context: string
  frames: ReplayFrame[]
  events: ReplayEvent[]
  outcomes: ReplayOutcome[]
  followThrough: ReplayFollowThrough[]
  lessons: string[]
}

