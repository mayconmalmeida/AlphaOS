import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { getAiInfraStatus } from "@/lib/env"
import { getSupabaseClient } from "@/lib/supabase"
import { buildMockAiResponse } from "@/services/ai/mock"
import type { AiRequest, AiResponse } from "@/services/ai/types"

type EdgeAiResponse<T = unknown> = {
  content?: string
  structuredData?: T | null
  provider?: "mock" | "openai"
  model?: string
  source?: "mock" | "edge"
}

export type AiService = {
  generate<T = unknown>(request: AiRequest): Promise<ApiResult<AiResponse<T>>>
  getStatus(): ReturnType<typeof getAiInfraStatus>
}

export function createAiService(): AiService {
  return {
    async generate<T = unknown>(request: AiRequest) {
      const status = getAiInfraStatus()
      const shouldUseMock = request.mockFallback !== false

      if (!status.edgeFunctionReady) {
        if (!shouldUseMock) {
          return err("Supabase nao configurado para Edge Functions.", "AI_INFRA_NOT_READY")
        }
        return ok(await buildMockAiResponse<T>(request))
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        if (!shouldUseMock) {
          return err("Cliente Supabase indisponivel.", "SUPABASE_CLIENT_UNAVAILABLE")
        }
        return ok(await buildMockAiResponse<T>(request))
      }

      const { data, error } = await supabase.functions.invoke<EdgeAiResponse<T>>(
        "generate-ai-response",
        {
          body: request,
        }
      )

      if (error) {
        if (!shouldUseMock) {
          return err(error.message, "EDGE_FUNCTION_ERROR")
        }
        return ok(await buildMockAiResponse<T>(request))
      }

      return ok({
        content: data?.content ?? "",
        structuredData: data?.structuredData ?? null,
        provider: data?.provider ?? "openai",
        model: data?.model ?? "unknown",
        source: data?.source ?? "edge",
      })
    },

    getStatus() {
      return getAiInfraStatus()
    },
  }
}

export const aiService = createAiService()

