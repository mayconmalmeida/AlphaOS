import OpenAI from "npm:openai"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type JsonSchema = {
  type?: string
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  required?: string[]
  enum?: Array<string | number | boolean>
}

type AiRequest = {
  taskType?: string
  input?: string
  schema?: JsonSchema
  mockFallback?: boolean
}

function buildValueFromSchema(schema?: JsonSchema): unknown {
  if (!schema) return null
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0]

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
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(schema.properties ?? {})) {
        result[key] = buildValueFromSchema(value)
      }
      return result
    }
    default:
      return null
  }
}

function buildMockResponse(body: AiRequest) {
  return {
    content:
      "Mock fallback ativo na Edge Function. Configure OPENAI_API_KEY para usar o provedor real.",
    structuredData: buildValueFromSchema(body.schema),
    provider: "mock",
    model: "mock-fallback",
    source: "mock",
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = (await request.json()) as AiRequest
    const apiKey = Deno.env.get("OPENAI_API_KEY")

    if (!apiKey) {
      return Response.json(buildMockResponse(body), { headers: corsHeaders })
    }

    const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini"
    const openai = new OpenAI({ apiKey })

    const response = await openai.responses.create({
      model,
      input: body.input ?? "",
      ...(body.schema
        ? {
            text: {
              format: {
                type: "json_schema",
                name: "alphaos_response",
                strict: true,
                schema: {
                  type: "object",
                  properties: body.schema.properties ?? {},
                  required: body.schema.required ?? [],
                  additionalProperties: false,
                },
              },
            },
          }
        : {}),
    })

    const textOutput =
      typeof response.output_text === "string" ? response.output_text : ""

    let structuredData: unknown = null
    if (textOutput) {
      try {
        structuredData = JSON.parse(textOutput)
      } catch {
        structuredData = null
      }
    }

    return Response.json(
      {
        content: textOutput || "Structured response generated successfully.",
        structuredData,
        provider: "openai",
        model,
        source: "edge",
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected Edge Function error"
    return Response.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    )
  }
})

