export type StrategyStage =
  | "hypothesis"
  | "generate"
  | "backtest"
  | "critic"
  | "approved"

export type StrategyStatus = "candidate" | "warning" | "approved"

export type StrategyMetrics = {
  totalReturn: number
  maxDrawdown: number
  sharpeProxy: number
  winRate: number
  profitFactor: number
  tradeCount: number
}

export type StrategySpec = {
  strategyName: string
  objective: string
  universe: string[]
  entryRules: string[]
  exitRules: string[]
  positionSizing: string
  rebalanceFrequency: string
  riskControls: string[]
  stopConditions: string[]
  benchmark: string
  timeHorizon: string
}

export type StrategyCandidate = {
  id: string
  hypothesisId: string
  hypothesisTitle?: string
  pipelineStage: StrategyStage
  status: StrategyStatus
  score: number
  origin?: "mock" | "generated"
  spec: StrategySpec
  metrics: StrategyMetrics
}

export type PipelineStep = {
  label: string
  status: "ready" | "active" | "mock"
  count?: number
}

export type StrategyComparison = {
  left: StrategyCandidate
  right: StrategyCandidate
}

