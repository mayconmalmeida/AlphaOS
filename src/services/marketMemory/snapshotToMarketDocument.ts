import type { MarketSnapshot } from "@/services/marketMemory/types"
import type { MarketDocumentType } from "@/services/pgvector/types"

function deriveMarketRegime(snapshot: MarketSnapshot) {
  const fg = snapshot.marketPulse.fearGreed
  const sentiment = snapshot.marketPulse.sentimentScore
  const momentum = snapshot.marketPulse.newsMomentum

  if (fg >= 70 && sentiment >= 0.6 && momentum >= 0.6) return "Bull Expansion"
  if (fg <= 35 && sentiment <= 0.35) return "Risk-Off / Deleveraging"
  if (momentum >= 0.7) return "Narrative Driven"
  return "Rotation / Range"
}

export function snapshotToMarketDocument(snapshot: MarketSnapshot): {
  id: string
  documentType: MarketDocumentType
  title: string
  content: string
  sourceRef: string
  metadata: Record<string, unknown>
} {
  const regime = deriveMarketRegime(snapshot)
  const capabilities = snapshot.sourceCapabilities ?? []
  const sourceMode = snapshot.sourceMode ?? "fallback"

  const narrativeSummary = snapshot.narratives
    .slice(0, 8)
    .map((n) => `${n.name} (strength ${Math.round(n.strength)}, velocity ${Math.round(n.velocity)})`)
    .join(" | ")

  const categorySummary = (snapshot.categories ?? [])
    .slice(0, 8)
    .map((c) => `${c.name} (strength ${Math.round(c.strength)}, rotation ${Math.round(c.rotationScore)})`)
    .join(" | ")

  const technicalSummary = (snapshot.technicals ?? [])
    .slice(0, 8)
    .map(
      (t) =>
        `${t.symbol} ${t.trend} (momentum ${Math.round(t.momentum * 100)}%, vol ${Math.round(
          t.volatility * 100
        )}%)`
    )
    .join(" | ")

  const quoteSummary = (snapshot.quotes ?? [])
    .slice(0, 8)
    .map((q) => `${q.symbol} ${q.priceUsd.toFixed(q.priceUsd >= 1000 ? 0 : 2)} USD`)
    .join(" | ")

  const newsSummary = (snapshot.news ?? [])
    .slice(0, 5)
    .map((item) => `${item.title} (${item.source})`)
    .join(" | ")

  const content = [
    `snapshot_id: ${snapshot.id}`,
    `date: ${snapshot.date}`,
    `market_regime: ${regime}`,
    `source_mode: ${sourceMode}`,
    `last_sync: ${snapshot.lastSyncAt ?? "N/A"}`,
    `cmc_capabilities_used: ${capabilities.join(", ") || "N/A"}`,
    `btc_dominance: ${snapshot.marketPulse.btcDominance.toFixed(2)}%`,
    `fear_greed: ${Math.round(snapshot.marketPulse.fearGreed)}`,
    `market_cap_usd: ${snapshot.marketPulse.marketCapUsd}`,
    `volume_24h_usd: ${snapshot.marketPulse.volume24hUsd}`,
    `sentiment_score: ${snapshot.marketPulse.sentimentScore}`,
    `news_momentum: ${snapshot.marketPulse.newsMomentum}`,
    `quotes: ${quoteSummary || "N/A"}`,
    `narratives: ${narrativeSummary || "N/A"}`,
    `categories: ${categorySummary || "N/A"}`,
    `technicals: ${technicalSummary || "N/A"}`,
    `news: ${newsSummary || "N/A"}`,
    `summary: ${snapshot.summary}`,
    `what_happened_next: ${snapshot.context.whatHappenedNext}`,
  ].join("\n")

  return {
    id: snapshot.id,
    documentType: "snapshot",
    title: snapshot.title,
    content,
    sourceRef: "alphaos://market_snapshots",
    metadata: {
      snapshotId: snapshot.id,
      date: snapshot.date,
      marketRegime: regime,
      narratives: snapshot.narratives.map((n) => ({
        name: n.name,
        strength: n.strength,
        velocity: n.velocity,
        growth: n.growth,
      })),
      quotes: snapshot.quotes ?? [],
      news: snapshot.news ?? [],
      categories: snapshot.categories ?? [],
      technicals: snapshot.technicals ?? [],
      marketPulse: snapshot.marketPulse,
      sourceMode,
      lastSyncAt: snapshot.lastSyncAt ?? null,
      cmcCapabilitiesUsed: capabilities,
    },
  }
}

export function getSnapshotMarketRegime(snapshot: MarketSnapshot) {
  return deriveMarketRegime(snapshot)
}

