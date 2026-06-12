import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { getCmcInfraStatus } from "@/lib/env"
import { cmcServices } from "@/services/cmc"
import { getCmcRuntimeStatus } from "@/services/cmc/runtime"
import { embeddingService } from "@/services/embeddings"
import type { EmbeddingDocument } from "@/services/embeddings"
import { marketSnapshotsRepository } from "@/services/marketMemory/MarketSnapshotsRepository"
import type { MarketSnapshot } from "@/services/marketMemory/types"
import { snapshotToMarketDocument } from "@/services/marketMemory/snapshotToMarketDocument"

type CmcIngestionResult = {
  snapshotTitle: string
  documentsQueued: number
  mode: "edge-proxy" | "mock"
  queuedDocumentIds: string[]
}

function nowStamp() {
  return new Date().toISOString()
}

function createDocId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export async function ingestCurrentCmcSnapshot(params?: {
  symbols?: string[]
}): Promise<ApiResult<CmcIngestionResult>> {
  const symbols = params?.symbols ?? ["BTC", "ETH", "SOL", "BNB", "XRP"]

  const [pulseRes, narrativesRes, categoriesRes, newsRes, technicalsRes, quotesRes] =
    await Promise.all([
      cmcServices.sentiment.getMarketPulse(),
      cmcServices.narratives.getNarratives(),
      cmcServices.categories.getCategories(),
      cmcServices.news.getLatestNews(),
      cmcServices.technicals.getTechnicals(symbols),
      cmcServices.quotes.getQuotes(symbols),
    ])

  const firstError = [
    pulseRes,
    narrativesRes,
    categoriesRes,
    newsRes,
    technicalsRes,
    quotesRes,
  ].find((item) => item.ok === false)

  if (firstError && firstError.ok === false) {
    return err(firstError.error.message, firstError.error.code)
  }

  if (
    pulseRes.ok === false ||
    narrativesRes.ok === false ||
    categoriesRes.ok === false ||
    newsRes.ok === false ||
    technicalsRes.ok === false ||
    quotesRes.ok === false
  ) {
    return err("Falha inesperada ao consolidar dados CMC.", "CMC_INGESTION_UNEXPECTED")
  }

  const timestamp = nowStamp()
  const pulse = pulseRes.data
  const narratives = narrativesRes.data.slice(0, 6)
  const categories = categoriesRes.data.slice(0, 6)
  const news = newsRes.data.slice(0, 5)
  const technicals = technicalsRes.data
  const quotes = quotesRes.data

  const snapshotTitle = `CMC Snapshot ${timestamp.slice(0, 16).replace("T", " ")}`

  const runtime = getCmcRuntimeStatus()
  const snapshotId = createDocId("cmc-snapshot")
  const snapshotRecord: MarketSnapshot = {
    id: snapshotId,
    date: timestamp.slice(0, 10),
    title: snapshotTitle,
    summary: `${runtime.sentiment.source === "live" ? "Live CMC data" : "Fallback data"}: market pulse ${Math.round(pulse.fearGreed)} FG with ${narratives[0]?.name ?? "mixed"} leadership.`,
    sourceMode: runtime.sentiment.source === "live" ? "live" : "fallback",
    lastSyncAt: runtime.sentiment.lastSync ?? timestamp,
    sourceCapabilities: Object.values(runtime)
      .filter((item) => item.source !== "idle")
      .map((item) => item.capability),
    marketPulse: {
      btcDominance: pulse.btcDominance,
      fearGreed: pulse.fearGreed,
      marketCapUsd: pulse.marketCapUsd,
      volume24hUsd: pulse.volume24hUsd,
      sentimentScore: pulse.sentimentScore,
      newsMomentum: pulse.newsMomentum,
    },
    narratives: narratives.map((item) => ({
      name: item.name,
      strength: item.strength,
      velocity: item.velocity,
      growth: item.growth,
    })),
    categories: categories.map((item) => ({
      name: item.name,
      strength: item.strength,
      rotationScore: item.rotationScore,
    })),
    technicals: technicals.map((item) => ({
      symbol: item.symbol,
      trend: item.trend,
      momentum: item.momentum,
      volatility: item.volatility,
    })),
    context: {
      historicalContext:
        "Snapshot ingested from CoinMarketCap coverage and normalized into market memory.",
      whatHappenedNext:
        "Use Market Replay and semantic retrieval to compare this snapshot against analogous periods.",
    },
  }

  const snapshotDoc = snapshotToMarketDocument(snapshotRecord)

  const documents: EmbeddingDocument[] = [
    {
      id: snapshotId,
      type: "market_snapshot",
      title: snapshotDoc.title,
      content: snapshotDoc.content,
      sourceRef: snapshotDoc.sourceRef,
      metadata: snapshotDoc.metadata,
    },
    {
      id: createDocId("cmc-narrative"),
      type: "narrative_report",
      title: `${snapshotTitle} — Narrative Intelligence`,
      content: narratives
        .map(
          (item) =>
            `${item.name}: strength ${item.strength}, velocity ${item.velocity}, growth ${item.growth}, rotation ${item.rotationScore}`
        )
        .join("\n"),
      sourceRef: "cmc://cryptocurrency/trending/latest",
      metadata: {
        provider: "coinmarketcap",
        timestamp,
      },
    },
    {
      id: createDocId("cmc-category"),
      type: "category_summary",
      title: `${snapshotTitle} — Category Rotation`,
      content: categories
        .map(
          (item) =>
            `${item.name}: strength ${item.strength}, rotation ${item.rotationScore}`
        )
        .join("\n"),
      sourceRef: "cmc://cryptocurrency/categories",
      metadata: {
        provider: "coinmarketcap",
        timestamp,
      },
    },
    {
      id: createDocId("cmc-technical"),
      type: "technical_summary",
      title: `${snapshotTitle} — Technical Summary`,
      content: technicals
        .map(
          (item) =>
            `${item.symbol}: trend ${item.trend}, momentum ${item.momentum}, volatility ${item.volatility}`
        )
        .join("\n"),
      sourceRef: "cmc://cryptocurrency/market_pairs/latest",
      metadata: {
        provider: "coinmarketcap",
        timestamp,
        symbols,
      },
    },
    {
      id: createDocId("cmc-news"),
      type: "news_summary",
      title: `${snapshotTitle} — News Summary`,
      content: news
        .map(
          (item) =>
            `${item.title} | source ${item.source} | sentiment ${item.sentimentScore ?? 0} | ${item.summary ?? ""}`
        )
        .join("\n"),
      sourceRef: "cmc://content/latest",
      metadata: {
        provider: "coinmarketcap",
        timestamp,
      },
    },
    {
      id: createDocId("cmc-sentiment"),
      type: "sentiment_summary",
      title: `${snapshotTitle} — Sentiment`,
      content: `Fear & Greed ${Math.round(pulse.fearGreed)} | sentiment ${pulse.sentimentScore} | news momentum ${pulse.newsMomentum}`,
      sourceRef: "cmc://fear-and-greed/latest",
      metadata: {
        provider: "coinmarketcap",
        timestamp,
      },
    },
  ]

  const enqueueRes = await embeddingService.enqueueDocuments(documents)
  if (enqueueRes.ok === false) {
    return err(enqueueRes.error.message, enqueueRes.error.code)
  }

  await marketSnapshotsRepository.upsert(snapshotRecord, documents[0].id)

  const status = getCmcInfraStatus()

  return ok({
    snapshotTitle,
    documentsQueued: documents.length,
    mode: status.mode,
    queuedDocumentIds: documents.map((doc) => doc.id),
  })
}

export type { CmcIngestionResult }

