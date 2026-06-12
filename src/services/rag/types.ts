export type RagEvidenceItem = {
  id: string
  title: string
  content: string
  sourceType: string
  sourceRef: string | null
  relevanceScore: number
  reasoning: string
  metadata: Record<string, unknown>
}

export type RagAnswer = {
  answer: string
  reasoning: string
  evidenceUsed: Array<{
    evidenceId: string
    title: string
    sourceType: string
    relevanceScore: number
    reasoning: string
  }>
  unsupportedClaimsBlocked: boolean
}

export type RagResponse = {
  question: string
  prompt: string
  evidence: RagEvidenceItem[]
  answer: RagAnswer
}

