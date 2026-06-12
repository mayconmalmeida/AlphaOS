import type { ApiResult } from "@/lib/api"
import { err, isErr, ok } from "@/lib/api"
import type { AiJsonSchema } from "@/services/ai"
import { aiService } from "@/services/ai"
import { cmcServices } from "@/services/cmc"
import { criticService } from "@/services/critic"
import { hypothesesService } from "@/services/hypotheses"
import { marketMemoryService } from "@/services/marketMemory"
import { retrieveEvidence } from "@/services/rag"
import { mockResearchReports } from "@/services/research/mockData"
import { researchRepository } from "@/services/research/ResearchRepository"
import type { ResearchReport } from "@/services/research/types"
import { strategiesService } from "@/services/strategies"

type ReportAiOutput = {
  title: string
  report_type: ResearchReport["reportType"]
  tone: ResearchReport["tone"]
  tags: string[]
  executive_summary: string
  sections: Array<{ title: string; body: string }>
}

const reportSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "report_type", "tone", "tags", "executive_summary", "sections"],
  properties: {
    title: { type: "string" },
    report_type: {
      type: "string",
      enum: ["Narrative Rotation", "Regime", "Cycle", "Hypothesis", "Institutional"],
    },
    tone: { type: "string", enum: ["constructive", "neutral", "cautious"] },
    tags: { type: "array", items: { type: "string" } },
    executive_summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
        },
      },
    },
  },
} satisfies AiJsonSchema

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function buildPrompt(input: unknown) {
  return [
    "Você é o AlphaOS Research Report Generator.",
    "Produza um relatório institucional (Bloomberg Research + Goldman Sachs style): profissional, limpo, objetivo.",
    "Não é aconselhamento financeiro. Não execute trades reais.",
    "Use apenas o contexto fornecido e evite claims sem evidência.",
    "Responda exclusivamente no JSON do schema.",
    "",
    "INPUT (JSON):",
    JSON.stringify(input, null, 2),
  ].join("\n")
}

function buildFallbackReport(params: {
  hypothesisTitle: string
  createdAt: string
  marketRegime: string
  topNarratives: string[]
  invalidatingConditions: string[]
  strategySummaries: string[]
  riskSummary: string[]
  evidenceSummary: string[]
  analogues: string[]
}): Omit<ResearchReport, "id"> {
  const title = `Institutional Memo — ${params.hypothesisTitle}`

  const sections = [
    {
      id: "exec",
      title: "Executive Summary",
      body: params.evidenceSummary.join("\n"),
    },
    {
      id: "regime",
      title: "Market Regime",
      body: `Base regime: ${params.marketRegime}\n\nSignal: focus on continuation with rising selectivity.`,
    },
    {
      id: "narratives",
      title: "Narrative Intelligence",
      body:
        params.topNarratives.length > 0
          ? `Leading narratives:\n- ${params.topNarratives.join("\n- ")}`
          : "Leading narratives are unavailable in this run.",
    },
    {
      id: "evidence",
      title: "Supporting Evidence",
      body:
        params.evidenceSummary.length > 0
          ? `Primary evidence:\n- ${params.evidenceSummary.join("\n- ")}`
          : "Evidence is unavailable in this run.",
    },
    {
      id: "analogue",
      title: "Historical Analogues",
      body:
        params.analogues.length > 0
          ? `Analogues and precedents:\n- ${params.analogues.join("\n- ")}`
          : "Historical analogues are unavailable in this run.",
    },
    {
      id: "hypothesis",
      title: "Alpha Hypothesis",
      body: `Thesis:\n${params.hypothesisTitle}\n\nWhy now: the hypothesis still offers asymmetry while market consensus remains incomplete.`,
    },
    {
      id: "strategies",
      title: "Strategy Candidates",
      body:
        params.strategySummaries.length > 0
          ? `Top candidates:\n- ${params.strategySummaries.join("\n- ")}`
          : "No strategies are available for this hypothesis yet.",
    },
    {
      id: "risk",
      title: "Risk Review",
      body:
        params.riskSummary.length > 0
          ? `Audit points:\n- ${params.riskSummary.join("\n- ")}`
          : "Risk review is unavailable in this run.",
    },
    {
      id: "invalid",
      title: "Invalidating Conditions",
      body:
        params.invalidatingConditions.length > 0
          ? `What would break the thesis:\n- ${params.invalidatingConditions.join("\n- ")}`
          : "Invalidating conditions were not provided.",
    },
    {
      id: "appendix",
      title: "Appendix",
      body:
        "This report consolidates AlphaOS modules such as Market Memory, Narrative Intelligence, Evidence/RAG, Hypothesis Engine, Strategy Lab, and Critic Agent in a readable, exportable format.",
    },
  ]

  return {
    title,
    reportType: "Institutional",
    createdAt: params.createdAt,
    tone: "neutral",
    author: "AlphaOS Generator",
    tags: ["Generated", "Institutional", ...params.topNarratives.slice(0, 3)],
    executiveSummary:
      params.evidenceSummary[0] ??
      "Institutional report generated from evidence, market context, and risk review.",
    sections,
  }
}

export type ResearchService = {
  listReports(): Promise<ApiResult<ResearchReport[]>>
  getById(id: string): Promise<ApiResult<ResearchReport>>
  generateReport(params?: { hypothesisId?: string }): Promise<ApiResult<ResearchReport>>
}

export function createResearchService(): ResearchService {
  async function getAllReports() {
    const generated = await researchRepository.listGenerated()
    return [...generated, ...mockResearchReports]
  }

  return {
    async listReports() {
      return ok(await getAllReports())
    },
    async getById(id) {
      const stored = await researchRepository.getById(id)
      const report = stored ?? (await getAllReports()).find((r) => r.id === id)
      if (!report) return err("Report not found", "RESEARCH_REPORT_NOT_FOUND")
      return ok(report)
    },
    async generateReport(params) {
      const date = new Date().toISOString().slice(0, 10)

      const listRes = await hypothesesService.list({ status: "all" })
      if (isErr(listRes)) {
        return err(listRes.error.message, listRes.error.code)
      }

      const hypothesisId =
        params?.hypothesisId ||
        listRes.data.find((h) => h.status !== "closed")?.id ||
        listRes.data[0]?.id

      if (!hypothesisId) {
        return err("No hypothesis is available to generate a report", "RESEARCH_NO_HYPOTHESES")
      }

      const hypothesisRes = await hypothesesService.getById(hypothesisId)
      if (hypothesisRes.ok === false) {
        return err(hypothesisRes.error.message, hypothesisRes.error.code)
      }

      const hypothesis = hypothesisRes.data
      const strategiesRes = await strategiesService.listCandidates({
        hypothesisId: hypothesis.id,
        status: "all",
      })
      const strategies = strategiesRes.ok ? strategiesRes.data.slice(0, 10) : []

      const criticReports = await Promise.all(
        strategies.slice(0, 5).map(async (strategy) => {
          const res = await criticService.reviewStrategy(strategy)
          return res.ok ? res.data : null
        })
      )

      const [snapshotsRes, narrativesRes, categoriesRes, sentimentRes, newsRes] =
        await Promise.all([
          marketMemoryService.listSnapshots(),
          cmcServices.narratives.getNarratives(),
          cmcServices.categories.getCategories(),
          cmcServices.sentiment.getMarketPulse(),
          cmcServices.news.getLatestNews(),
        ])

      const latestSnapshot = snapshotsRes.ok ? snapshotsRes.data[0] ?? null : null
      const similarRes =
        latestSnapshot && snapshotsRes.ok
          ? await marketMemoryService.findSimilarSnapshots(latestSnapshot.id)
          : null
      const similar = similarRes && similarRes.ok ? similarRes.data.slice(0, 3) : []

      const topNarratives = narrativesRes.ok
        ? narrativesRes.data
            .slice()
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 6)
            .map((n) => n.name)
        : []

      const ragQuestion = [
        "Gerar relatório institucional para hipótese:",
        hypothesis.title,
        hypothesis.description,
      ].join("\n")
      const ragRes = await retrieveEvidence(ragQuestion)
      const ragEvidence = ragRes.ok ? ragRes.data : []

      const strategySummaries = strategies.slice(0, 5).map((s) => {
        return `${s.spec.strategyName} — score ${s.score} — ${s.spec.timeHorizon} — universe ${s.spec.universe.join(", ")}`
      })

      const riskSummary = criticReports
        .filter((r): r is NonNullable<typeof r> => Boolean(r))
        .map((r) => `${r.overallStatus} — score ${r.score}`)

      const evidenceSummary = [
        ...hypothesis.evidence.slice(0, 4).map((e) => `${e.sourceType}: ${e.sourceName}`),
        ...ragEvidence.slice(0, 2).map((e) => `${e.sourceType}: ${e.title}`),
      ]

      const analogues = [
        ...hypothesis.historicalAnalogues.slice(0, 2).map((a) => `${a.label} (${Math.round(a.similarity * 100)}%)`),
        ...similar.map((s) => `${s.snapshot.title} (${Math.round(s.similarity * 100)}%)`),
      ]

      const input = {
        hypothesis,
        market_memory: {
          latest_snapshot: latestSnapshot,
          similar_snapshots: similar,
        },
        narrative_intelligence: {
          narratives: narrativesRes.ok ? narrativesRes.data : [],
          categories: categoriesRes.ok ? categoriesRes.data : [],
        },
        sentiment: sentimentRes.ok ? sentimentRes.data : null,
        news: newsRes.ok ? newsRes.data : [],
        rag_evidence: ragEvidence,
        strategy_results: strategies,
        critic_reports: criticReports.filter(Boolean),
        required_structure: [
          "Executive Summary",
          "Market Regime",
          "Narrative Intelligence",
          "Supporting Evidence",
          "Historical Analogues",
          "Alpha Hypothesis",
          "Strategy Candidates",
          "Risk Review",
          "Invalidating Conditions",
          "Appendix",
        ],
      }

      const prompt = buildPrompt(input)

      const aiRes = await aiService.generate<ReportAiOutput>({
        taskType: "research_report",
        input: prompt,
        schema: reportSchema,
        mockFallback: true,
      })

      const fallback = buildFallbackReport({
        hypothesisTitle: hypothesis.title,
        createdAt: date,
        marketRegime: hypothesis.marketRegime,
        topNarratives,
        invalidatingConditions: hypothesis.invalidatingConditions,
        strategySummaries,
        riskSummary,
        evidenceSummary,
        analogues,
      })

      const output =
        aiRes.ok &&
        aiRes.data.source === "edge" &&
        aiRes.data.structuredData &&
        typeof aiRes.data.structuredData.title === "string"
          ? aiRes.data.structuredData
          : null

      const report: ResearchReport = output
        ? {
            id: createId(),
            title: output.title,
            reportType: output.report_type,
            createdAt: date,
            tone: output.tone,
            author: "AlphaOS Generator",
            tags: output.tags,
            executiveSummary: output.executive_summary,
            sections: output.sections.map((s, idx) => ({
              id: `${idx + 1}`,
              title: s.title,
              body: s.body,
            })),
          }
        : { id: createId(), ...fallback }

      await researchRepository.upsert(report)
      return ok(report)
    },
  }
}

export const researchService = createResearchService()

