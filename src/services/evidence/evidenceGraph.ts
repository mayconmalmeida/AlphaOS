import type { HypothesisDetail } from "@/services/hypotheses/types"
import type { RagEvidenceItem } from "@/services/rag/types"
import type {
  EvidenceGraphEdge,
  EvidenceGraphNode,
  ProvenanceSource,
  ProvenanceSummary,
} from "@/services/evidence/types"

type GraphResult = {
  nodes: EvidenceGraphNode[]
  edges: EvidenceGraphEdge[]
}

function percent(value: number) {
  if (value <= 1) return Math.round(value * 100)
  return Math.round(value)
}

export function buildHypothesisEvidenceGraph(
  hypothesis: HypothesisDetail,
  ragEvidence: RagEvidenceItem[] = []
): GraphResult {
  const nodes: EvidenceGraphNode[] = [
    {
      id: `hypothesis:${hypothesis.id}`,
      label: hypothesis.title,
      kind: "hypothesis",
      confidence: hypothesis.confidence,
      relevance: 100,
      x: 340,
      y: 140,
    },
  ]

  const edges: EvidenceGraphEdge[] = []

  hypothesis.narrativeSignals.slice(0, 4).forEach((signal, index) => {
    const id = `narrative:${index}`
    nodes.push({
      id,
      label: signal.name,
      kind: "narrative",
      confidence: signal.strength,
      relevance: signal.velocity,
      x: 90,
      y: 60 + index * 88,
    })
    edges.push({
      id: `${id}:hypothesis`,
      from: id,
      to: `hypothesis:${hypothesis.id}`,
      kind: "influenced_by",
      weight: signal.rotationScore,
    })
  })

  hypothesis.evidence.slice(0, 6).forEach((item, index) => {
    const kind =
      item.sourceType === "technicals"
        ? "technical"
        : item.sourceType === "sentiment"
          ? "sentiment"
          : item.sourceType === "news"
            ? "news"
            : item.sourceType === "narrative"
              ? "narrative"
              : "historical"

    nodes.push({
      id: `evidence:${item.id}`,
      label: item.sourceName,
      kind,
      confidence: percent(item.confidence),
      relevance: percent(item.impactScore),
      x: 600,
      y: 40 + index * 72,
    })
    edges.push({
      id: `supports:${item.id}`,
      from: `evidence:${item.id}`,
      to: `hypothesis:${hypothesis.id}`,
      kind: "supports",
      weight: percent(item.impactScore),
    })
  })

  hypothesis.historicalAnalogues.slice(0, 3).forEach((analogue, index) => {
    const id = `historical:${analogue.id}`
    nodes.push({
      id,
      label: analogue.label,
      kind: "historical",
      confidence: percent(analogue.similarity),
      relevance: percent(analogue.similarity),
      x: 340,
      y: 300 + index * 72,
    })
    edges.push({
      id: `${id}:derived`,
      from: id,
      to: `hypothesis:${hypothesis.id}`,
      kind: "similar_to",
      weight: percent(analogue.similarity),
    })
  })

  ragEvidence.slice(0, 4).forEach((item, index) => {
    const id = `rag:${item.id}`
    nodes.push({
      id,
      label: item.title,
      kind: "evidence",
      confidence: percent(item.relevanceScore),
      relevance: percent(item.relevanceScore),
      x: 850,
      y: 80 + index * 84,
    })
    edges.push({
      id: `${id}:correlates`,
      from: id,
      to: `hypothesis:${hypothesis.id}`,
      kind: "correlates_with",
      weight: percent(item.relevanceScore),
    })
  })

  return { nodes, edges }
}

export function buildProvenanceSummary(params: {
  title: string
  lastUpdated?: string
  evidenceCount: number
  confidence: number
  relevance: number
  quality: string
  historicalAnalogues: string[]
  sources: ProvenanceSource[]
}): ProvenanceSummary {
  return {
    title: params.title,
    lastUpdated: params.lastUpdated ?? new Date().toISOString(),
    evidenceCount: params.evidenceCount,
    confidence: params.confidence,
    relevance: params.relevance,
    evidenceQuality: params.quality,
    historicalAnalogues: params.historicalAnalogues,
    sources: params.sources,
  }
}

