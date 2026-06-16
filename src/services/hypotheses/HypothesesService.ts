import type { ApiResult } from "@/lib/api"
import { err, isErr, ok } from "@/lib/api"
import { aiService } from "@/services/ai"
import { cmcServices } from "@/services/cmc"
import { mockHypotheses } from "@/services/hypotheses/mockData"
import { hypothesesRepository } from "@/services/hypotheses/HypothesesRepository"
import type { Hypothesis, HypothesisDetail } from "@/services/hypotheses/types"
import { marketMemoryService } from "@/services/marketMemory"
import { retrieveEvidence } from "@/services/rag"

type HypothesisGenerationOutput = {
  title: string
  description: string
  confidence: number
  risk_score: number
  expected_horizon: string
  market_regime: string
  related_assets: string[]
  related_narratives: string[]
  supporting_evidence: Array<{
    source_type: string
    source_name: string
    relevance_score: number
    reasoning: string
  }>
  invalidating_conditions: string[]
  why_now: string
  status: "open" | "watch" | "closed"
}

const hypothesisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "description",
    "confidence",
    "risk_score",
    "expected_horizon",
    "market_regime",
    "related_assets",
    "related_narratives",
    "supporting_evidence",
    "invalidating_conditions",
    "why_now",
    "status",
  ],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    confidence: { type: "number" },
    risk_score: { type: "number" },
    expected_horizon: { type: "string" },
    market_regime: { type: "string" },
    related_assets: { type: "array", items: { type: "string" } },
    related_narratives: { type: "array", items: { type: "string" } },
    supporting_evidence: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["source_type", "source_name", "relevance_score", "reasoning"],
        properties: {
          source_type: { type: "string" },
          source_name: { type: "string" },
          relevance_score: { type: "number" },
          reasoning: { type: "string" },
        },
      },
    },
    invalidating_conditions: { type: "array", items: { type: "string" } },
    why_now: { type: "string" },
    status: { type: "string", enum: ["open", "watch", "closed"] },
  },
} satisfies Parameters<typeof aiService.generate>[0]["schema"]

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normalizePercent(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value <= 1) return clamp(Math.round(value * 100), 0, 100)
  return clamp(Math.round(value), 0, 100)
}

function normalizeRisk(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value <= 1) return clamp(Math.round(value * 100), 0, 100)
  return clamp(Math.round(value), 0, 100)
}

function buildPrompt(input: {
  focus: string
  snapshot: unknown
  ragEvidence: unknown
  narratives: unknown
  technicals: unknown
  sentiment: unknown
  categories: unknown
  news: unknown
}) {
  return [
    "Você é o AlphaOS Hypothesis Generation Engine.",
    "Gere hipóteses de mercado explicáveis (não sinais de trade; não aconselhamento financeiro).",
    "Use apenas o contexto fornecido. Se algo não estiver suportado, reduza confidence e deixe explícito em supporting_evidence.",
    "Responda exclusivamente no JSON estruturado do schema.",
    "",
    `FOCUS: ${input.focus}`,
    "",
    "INPUT (JSON):",
    JSON.stringify(
      {
        snapshot: input.snapshot,
        ragEvidence: input.ragEvidence,
        narratives: input.narratives,
        technicals: input.technicals,
        sentiment: input.sentiment,
        categories: input.categories,
        news: input.news,
      },
      null,
      2
    ),
  ].join("\n")
}

function buildFallbackOutput(params: {
  topNarratives: string[]
  relatedAssets: string[]
}): HypothesisGenerationOutput {
  const primary = params.topNarratives[0] ?? "AI Infrastructure"
  return {
    title: `${primary}: repricing asymmetry emerging`,
    description:
      "Fallback hypothesis: signals point to attention rotating into the theme with tighter dispersion, creating repricing potential in category leaders. Confirm with sustained volume and continued headlines.",
    confidence: 62,
    risk_score: 48,
    expected_horizon: "30–60 Days",
    market_regime: "Narrative Driven",
    related_assets: params.relatedAssets,
    related_narratives: params.topNarratives.slice(0, 3),
    supporting_evidence: [
      {
        source_type: "narrative",
        source_name: "Narrative strength/velocity",
        relevance_score: 0.62,
        reasoning:
          "Dominant narratives with persistent velocity often precede repricing, but still need liquidity confirmation.",
      },
    ],
    invalidating_conditions: [
      "Volume and participation break down in the theme leaders",
      "Sentiment reverses while volatility rises",
      "A negative headline changes the market framing",
    ],
    why_now:
      "The signal set points to continued thematic strength with rotation into quality; risk rises quickly if the market shifts into a higher-volatility regime.",
    status: "open",
  }
}

function mapEvidenceSourceType(sourceType: string) {
  const value = sourceType.toLowerCase()
  if (value.includes("narrative")) return "narrative"
  if (value.includes("news")) return "news"
  if (value.includes("sentiment")) return "sentiment"
  if (value.includes("technical")) return "technicals"
  if (value.includes("histor")) return "historical"
  return "historical"
}

function buildHypothesisDetail(params: {
  output: HypothesisGenerationOutput
  ragEvidence: Array<{
    id: string
    title: string
    sourceType: string
    relevanceScore: number
    reasoning: string
  }>
  narrativeSignals: Array<{
    name: string
    strength: number
    velocity: number
    growth: number
    rotationScore: number
  }>
  analogues: Array<{
    id: string
    label: string
    similarity: number
    context: string
    whatHappenedNext: string
  }>
}): HypothesisDetail {
  const id = createId()

  const evidenceFromOutput = params.output.supporting_evidence.map((e, idx) => ({
    id: `${id}:o:${idx + 1}`,
    hypothesisId: id,
    sourceType: mapEvidenceSourceType(e.source_type) as HypothesisDetail["evidence"][number]["sourceType"],
    sourceName: e.source_name,
    confidence: clamp(e.relevance_score, 0, 1),
    impactScore: clamp(e.relevance_score, 0, 1),
    reasoning: e.reasoning,
  }))

  const evidenceFromRag = params.ragEvidence.slice(0, 6).map((e, idx) => ({
    id: `${id}:r:${idx + 1}`,
    hypothesisId: id,
    sourceType: mapEvidenceSourceType(e.sourceType) as HypothesisDetail["evidence"][number]["sourceType"],
    sourceName: e.title,
    confidence: clamp(e.relevanceScore, 0, 1),
    impactScore: clamp(e.relevanceScore, 0, 1),
    reasoning: e.reasoning,
  }))

  const evidence = [...evidenceFromOutput, ...evidenceFromRag].slice(0, 12)

  return {
    id,
    origin: "generated",
    title: params.output.title,
    description: params.output.description,
    confidence: normalizePercent(params.output.confidence),
    riskScore: normalizeRisk(params.output.risk_score),
    expectedHorizon: params.output.expected_horizon,
    status: params.output.status,
    marketRegime: params.output.market_regime,
    relatedNarratives: params.output.related_narratives,
    relatedAssets: params.output.related_assets,
    evidenceCount: evidence.length,
    whyNow: params.output.why_now,
    invalidatingConditions: params.output.invalidating_conditions,
    evidence,
    narrativeSignals: params.narrativeSignals.map((n) => ({
      name: n.name,
      strength: Math.round(n.strength),
      velocity: Math.round(n.velocity),
      growth: Math.round(n.growth),
      rotationScore: Math.round(n.rotationScore),
      interpretation:
        n.velocity > 70
          ? "High acceleration; risk rises if market dispersion starts to deteriorate."
          : n.velocity > 55
            ? "Moderate acceleration; requires confirmation from volume and continued headlines."
            : "Lower acceleration; the thesis depends on fresh catalysts.",
    })),
    historicalAnalogues: params.analogues.map((a) => ({
      id: a.id,
      label: a.label,
      similarity: a.similarity,
      context: a.context,
      whatHappenedNext: a.whatHappenedNext,
    })),
  }
}

export type HypothesesService = {
  list(query?: { search?: string; status?: string }): Promise<ApiResult<Hypothesis[]>>
  getById(id: string): Promise<ApiResult<HypothesisDetail>>
  generate(params?: { focus?: string }): Promise<ApiResult<HypothesisDetail>>
}

export function createHypothesesService(): HypothesesService {
  async function getAllHypotheses() {
    const generated = await hypothesesRepository.listGenerated()
    return [...generated, ...mockHypotheses]
  }

  return {
    async list(query) {
      const search = query?.search?.trim().toLowerCase()
      const status = query?.status?.trim().toLowerCase()

      const data = (await getAllHypotheses())
        .filter((item) => {
          if (status && status !== "all" && item.status !== status) return false
          if (!search) return true
          const haystack = [
            item.id,
            item.title,
            item.description,
            item.marketRegime,
            ...item.relatedNarratives,
          ]
            .join(" ")
            .toLowerCase()
          return haystack.includes(search)
        })
        .map<Hypothesis>((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          confidence: item.confidence,
          riskScore: item.riskScore,
          expectedHorizon: item.expectedHorizon,
          status: item.status,
          marketRegime: item.marketRegime,
          relatedNarratives: item.relatedNarratives,
          relatedAssets: item.relatedAssets,
          evidenceCount: item.evidenceCount,
          whyNow: item.whyNow,
          invalidatingConditions: item.invalidatingConditions,
          origin: item.origin,
        }))

      return ok(data)
    },

    async getById(id) {
      const stored = await hypothesesRepository.getById(id)
      const data = stored ?? (await getAllHypotheses()).find((item) => item.id === id)
      if (!data) return err("Hypothesis not found", "HYPOTHESIS_NOT_FOUND")
      return ok(data)
    },

    async generate(params) {
      const focus =
        params?.focus?.trim() || "Generate an explainable hypothesis from the current snapshot"
      const symbols = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"]

      const [snapshotsRes, sentimentRes, narrativesRes, categoriesRes, newsRes, quotesRes, technicalsRes] =
        await Promise.all([
          marketMemoryService.listSnapshots(),
          cmcServices.sentiment.getMarketPulse(),
          cmcServices.narratives.getNarratives(),
          cmcServices.categories.getCategories(),
          cmcServices.news.getLatestNews(),
          cmcServices.quotes.getQuotes(symbols),
          cmcServices.technicals.getTechnicals(symbols),
        ])

      if (isErr(snapshotsRes)) {
        return err(snapshotsRes.error.message, snapshotsRes.error.code)
      }

      const latestSnapshot = snapshotsRes.data[0] ?? null
      if (!latestSnapshot) {
        return err("No snapshot is available to generate a hypothesis", "HYPOTHESIS_SNAPSHOT_UNAVAILABLE")
      }

      const similarRes = await marketMemoryService.findSimilarSnapshots(latestSnapshot.id)
      const similar = isErr(similarRes) ? [] : similarRes.data

      const topNarratives = (isErr(narrativesRes) ? [] : narrativesRes.data)
        .slice()
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 5)

      const ragQuestion = [
        focus,
        `Snapshot: ${latestSnapshot.title} (${latestSnapshot.date})`,
        `Top narratives: ${topNarratives.map((n) => n.name).slice(0, 3).join(", ")}`,
      ].join("\n")

      const ragRes = await retrieveEvidence(ragQuestion)
      const ragEvidence = ragRes.ok ? ragRes.data : []

      const prompt = buildPrompt({
        focus,
        snapshot: latestSnapshot,
        ragEvidence,
        narratives: isErr(narrativesRes) ? [] : narrativesRes.data,
        technicals: isErr(technicalsRes) ? [] : technicalsRes.data,
        sentiment: isErr(sentimentRes) ? null : sentimentRes.data,
        categories: isErr(categoriesRes) ? [] : categoriesRes.data,
        news: isErr(newsRes) ? [] : newsRes.data,
      })

      const aiRes = await aiService.generate<HypothesisGenerationOutput>({
        taskType: "hypothesis_generation",
        input: prompt,
        schema: hypothesisSchema,
        mockFallback: true,
      })

      const fallback = buildFallbackOutput({
        topNarratives: topNarratives.map((n) => n.name),
        relatedAssets: symbols.slice(0, 3),
      })

      const output =
        aiRes.ok &&
        aiRes.data.source === "edge" &&
        aiRes.data.structuredData &&
        typeof (aiRes.data.structuredData as HypothesisGenerationOutput).title === "string"
          ? (aiRes.data.structuredData as HypothesisGenerationOutput)
          : fallback

      const groundedOutput =
        ragEvidence.length > 0
          ? output
          : {
              ...output,
              confidence: Math.min(normalizePercent(output.confidence), 39),
              risk_score: Math.max(normalizeRisk(output.risk_score), 65),
              status: "watch" as const,
              description: `${output.description} AlphaOS did not retrieve supporting evidence from Market Memory / RAG, so the thesis remains ungrounded.`,
              why_now:
                "Insufficient evidence from Market Memory / RAG to issue a higher-confidence thesis right now.",
              supporting_evidence: [
                {
                  source_type: "research",
                  source_name: "RAG retrieval",
                  relevance_score: 0.24,
                  reasoning:
                    "Semantic retrieval returned no supporting evidence, so AlphaOS downgraded confidence and blocked stronger claims.",
                },
                ...output.supporting_evidence,
              ].slice(0, 6),
            }

      const narrativeSignals = topNarratives.map((n) => ({
        name: n.name,
        strength: n.strength,
        velocity: n.velocity,
        growth: n.growth,
        rotationScore: n.rotationScore,
      }))

      const analogues = similar.slice(0, 3).map((item, idx) => ({
        id: `${latestSnapshot.id}:a:${idx + 1}`,
        label: item.snapshot.title,
        similarity: item.similarity,
        context: item.snapshot.summary,
        whatHappenedNext: item.snapshot.context.whatHappenedNext,
      }))

      const detail = buildHypothesisDetail({
        output: groundedOutput,
        ragEvidence: ragEvidence.map((e) => ({
          id: e.id,
          title: e.title,
          sourceType: e.sourceType,
          relevanceScore: e.relevanceScore,
          reasoning: e.reasoning,
        })),
        narrativeSignals,
        analogues,
      })

      await hypothesesRepository.upsert(detail)
      return ok(detail)
    },
  }
}

export const hypothesesService = createHypothesesService()

