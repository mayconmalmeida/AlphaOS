export type AiJsonSchema = {
  type?: string
  properties?: Record<string, AiJsonSchema>
  items?: AiJsonSchema
  required?: readonly string[]
  enum?: ReadonlyArray<string | number | boolean>
  additionalProperties?: boolean
}

export type AiRequest = {
  taskType: string
  input: string
  schema?: AiJsonSchema
  mockFallback?: boolean
}

export type AiResponse<T = unknown> = {
  content: string
  structuredData: T | null
  provider: "mock" | "openai"
  model: string
  source: "mock" | "edge"
}

