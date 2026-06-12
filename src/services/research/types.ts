export type ResearchReportType =
  | "Narrative Rotation"
  | "Regime"
  | "Cycle"
  | "Hypothesis"
  | "Institutional"

export type ResearchTone = "constructive" | "neutral" | "cautious"

export type ResearchSection = {
  id: string
  title: string
  body: string
}

export type ResearchReport = {
  id: string
  title: string
  reportType: ResearchReportType
  createdAt: string
  tone: ResearchTone
  author: string
  tags: string[]
  executiveSummary: string
  sections: ResearchSection[]
}

