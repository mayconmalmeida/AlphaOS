import OpenAI from "npm:openai"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type EmbeddingRequest = {
  input?: string
  metadata?: Record<string, unknown>
}

function hashString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

function buildMockEmbedding(input: string) {
  const seed = hashString(input)
  const dimensions = 1536
  const embedding = Array.from({ length: dimensions }).map((_, index) => {
    const value = ((seed + index * 97) % 1000) / 1000
    return Number((value * 2 - 1).toFixed(6))
  })

  return {
    embedding,
    dimensions,
    provider: "mock",
    model: "mock-embedding-v1",
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = (await request.json()) as EmbeddingRequest
    const input = body.input?.trim() ?? ""
    if (!input) {
      return Response.json(
        { error: "Input is required." },
        { status: 400, headers: corsHeaders }
      )
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY")
    if (!apiKey) {
      return Response.json(buildMockEmbedding(input), { headers: corsHeaders })
    }

    const model = Deno.env.get("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small"
    const openai = new OpenAI({ apiKey })
    const response = await openai.embeddings.create({
      model,
      input,
    })

    return Response.json(
      {
        embedding: response.data[0]?.embedding ?? [],
        dimensions: response.data[0]?.embedding?.length ?? 0,
        provider: "openai",
        model,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected embedding function error"
    return Response.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    )
  }
})

