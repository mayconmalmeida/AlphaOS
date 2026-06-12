import type { EmbeddingDocument } from "@/services/embeddings/types"

export const sampleEmbeddingDocuments: EmbeddingDocument[] = [
  {
    id: "doc-snapshot-1",
    type: "market_snapshot",
    title: "Current Market Snapshot",
    content:
      "BTC dominance stable, AI narratives strengthening, sentiment constructive, volume expanding in infrastructure names.",
    sourceRef: "/dashboard",
    metadata: { regime: "Bull Expansion" },
  },
  {
    id: "doc-news-1",
    type: "news_summary",
    title: "AI Infrastructure News Cluster",
    content:
      "News flow reframes AI as infrastructure and productivity, increasing institutional interest and reducing speculative framing.",
    sourceRef: "/research",
  },
  {
    id: "doc-history-1",
    type: "historical_context",
    title: "Historical Analogue: 2023 AI Expansion",
    content:
      "Historical analogue showing rotation from speculative beta into infrastructure leaders before breadth softened.",
    sourceRef: "/market-memory",
  },
]

