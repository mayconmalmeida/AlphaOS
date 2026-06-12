export type CriticStatus = "approved" | "warning" | "rejected"

export type CriticItemStatus = "passed" | "warning" | "failed"

export type CriticCheck = {
  key: string
  label: string
  status: CriticItemStatus
  score: number
  reasoning: string
}

export type CriticReport = {
  strategyId: string
  overallStatus: CriticStatus
  score: number
  findings: string[]
  warnings: string[]
  failureReasons: string[]
  recommendedAdjustments: string[]
  checks: CriticCheck[]
}

