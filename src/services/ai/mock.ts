import type { AiJsonSchema, AiRequest, AiResponse } from "@/services/ai/types"

function buildValueFromSchema(schema?: AiJsonSchema): unknown {
  if (!schema) return null

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0]
  }

  switch (schema.type) {
    case "string":
      return "mock-value"
    case "number":
    case "integer":
      return 1
    case "boolean":
      return true
    case "array":
      return schema.items ? [buildValueFromSchema(schema.items)] : []
    case "object": {
      const properties = schema.properties ?? {}
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(properties)) {
        result[key] = buildValueFromSchema(value)
      }
      return result
    }
    default:
      return null
  }
}

export async function buildMockAiResponse<T = unknown>(
  request: AiRequest
): Promise<AiResponse<T>> {
  const structuredData = buildValueFromSchema(request.schema) as T | null

  return {
    content:
      "Live AI is not available yet. Configure the required Edge Function secret to switch AlphaOS from simulated output to live generation.",
    structuredData,
    provider: "mock",
    model: "mock-fallback",
    source: "mock",
  }
}

