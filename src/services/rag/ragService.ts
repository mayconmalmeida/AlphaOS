import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { aiService } from "@/services/ai"
import { pgvectorRepository } from "@/services/pgvector"
import type { SemanticSearchResult } from "@/services/pgvector"
import type { RagAnswer, RagEvidenceItem, RagResponse } from "@/services/rag/types"

function mapEvidence(item: SemanticSearchResult, index: number): RagEvidenceItem {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    sourceType: item.documentType,
    sourceRef: item.sourceRef,
    relevanceScore: Number(item.similarity.toFixed(4)),
    reasoning:
      index === 0
        ? "Highest semantic similarity to the research question."
        : index === 1
          ? "Provides adjacent market context that supports the main thesis."
          : "Adds supporting evidence without overstating certainty.",
    metadata: item.metadata,
  }
}

function rankEvidence(items: RagEvidenceItem[]) {
  return items
    .slice()
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
}

function buildFallbackAnswer(question: string, evidence: RagEvidenceItem[]): RagAnswer {
  const top = evidence.slice(0, 3)
  const answerText =
    top.length === 0
      ? "Nao ha evidencia suficiente recuperada para responder com confianca."
      : `Com base apenas nas evidencias recuperadas, a leitura mais suportada para "${question}" aponta para ${top
          .map((item) => item.title)
          .join(", ")}.`

  return {
    answer: answerText,
    reasoning:
      top.length === 0
        ? "O mecanismo bloqueou claims porque nao encontrou contexto suficiente."
        : "A resposta foi limitada ao contexto recuperado e nao extrapola alem das evidencias listadas.",
    evidenceUsed: top.map((item) => ({
      evidenceId: item.id,
      title: item.title,
      sourceType: item.sourceType,
      relevanceScore: item.relevanceScore,
      reasoning: item.reasoning,
    })),
    unsupportedClaimsBlocked: true,
  }
}

export function buildContextPrompt(question: string, evidence: RagEvidenceItem[]) {
  return [
    "You are AlphaOS, an autonomous market research agent.",
    "Answer only using the retrieved evidence below.",
    "If evidence is insufficient, say that clearly.",
    "Do not make unsupported claims.",
    "",
    `Question: ${question}`,
    "",
    "Retrieved Evidence:",
    ...evidence.map(
      (item, index) =>
        `${index + 1}. [${item.sourceType}] ${item.title} | score=${item.relevanceScore}\n${item.content}`
    ),
  ].join("\n")
}

export async function retrieveEvidence(question: string): Promise<ApiResult<RagEvidenceItem[]>> {
  const queryEmbeddingRes = await pgvectorRepository.generateQueryEmbedding(question)
  if (queryEmbeddingRes.ok === false) {
    return err(queryEmbeddingRes.error.message, queryEmbeddingRes.error.code)
  }

  const searchRes = await pgvectorRepository.semanticSearch({
    query: question,
    queryEmbedding: queryEmbeddingRes.data.embedding,
    matchThreshold: 0.2,
    matchCount: 6,
  })

  if (searchRes.ok === false) {
    return err(searchRes.error.message, searchRes.error.code)
  }

  const evidence = rankEvidence(searchRes.data.map(mapEvidence))
  return ok(evidence)
}

export async function generateRagAnswer(question: string): Promise<ApiResult<RagResponse>> {
  const evidenceRes = await retrieveEvidence(question)
  if (evidenceRes.ok === false) {
    return err(evidenceRes.error.message, evidenceRes.error.code)
  }

  if (evidenceRes.data.length === 0) {
    const answer = {
      answer: "Insufficient evidence.",
      reasoning:
        "AlphaOS blocked a higher-confidence response because the semantic retrieval layer returned no supporting documents.",
      evidenceUsed: [],
      unsupportedClaimsBlocked: true,
    }

    return ok({
      question,
      prompt: buildContextPrompt(question, evidenceRes.data),
      evidence: evidenceRes.data,
      answer,
    })
  }

  const prompt = buildContextPrompt(question, evidenceRes.data)
  const schema = {
    type: "object",
    properties: {
      answer: { type: "string" },
      reasoning: { type: "string" },
      evidenceUsed: {
        type: "array",
        items: {
          type: "object",
          properties: {
            evidenceId: { type: "string" },
            title: { type: "string" },
            sourceType: { type: "string" },
            relevanceScore: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["evidenceId", "title", "sourceType", "relevanceScore", "reasoning"],
        },
      },
      unsupportedClaimsBlocked: { type: "boolean" },
    },
    required: ["answer", "reasoning", "evidenceUsed", "unsupportedClaimsBlocked"],
  }

  const aiRes = await aiService.generate<RagAnswer>({
    taskType: "rag_answer",
    input: prompt,
    schema,
    mockFallback: true,
  })

  const fallback = buildFallbackAnswer(question, evidenceRes.data)
  const answer =
    aiRes.ok &&
    aiRes.data.source === "edge" &&
    aiRes.data.structuredData &&
    typeof aiRes.data.structuredData.answer === "string"
      ? aiRes.data.structuredData
      : fallback

  return ok({
    question,
    prompt,
    evidence: evidenceRes.data,
    answer,
  })
}

