export type EvidenceNodeKind =
  | "market"
  | "narrative"
  | "hypothesis"
  | "evidence"
  | "historical"
  | "category"
  | "technical"
  | "sentiment"
  | "news"

export type EvidenceEdgeKind =
  | "supports"
  | "correlates_with"
  | "derived_from"
  | "influenced_by"
  | "similar_to"

export type EvidenceGraphNode = {
  id: string
  label: string
  kind: EvidenceNodeKind
  confidence?: number
  relevance?: number
  x: number
  y: number
}

export type EvidenceGraphEdge = {
  id: string
  from: string
  to: string
  kind: EvidenceEdgeKind
  weight?: number
}

export type ProvenanceSource = {
  label: string
  used: boolean
  freshness: string
  reliability: string
  sourceType?: string
  mode?: "live" | "fallback" | "cache" | "unknown"
  timestamp?: string
  relevanceScore?: number
  confidenceScore?: number
  capability?: string
}

export type ProvenanceSummary = {
  title: string
  lastUpdated: string
  evidenceCount: number
  confidence: number
  relevance: number
  evidenceQuality: string
  historicalAnalogues: string[]
  sources: ProvenanceSource[]
}

