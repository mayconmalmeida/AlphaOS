import type {
  CmcCategoryDto,
  CmcMarketPulseDto,
  CmcNarrativeDto,
  CmcNewsItemDto,
  CmcQuoteDto,
  CmcTechnicalDto,
} from "@/services/cmc/dto"
import type { CmcProvider } from "@/services/cmc/provider"
import { getSupabaseClient } from "@/lib/supabase"

type CmcProxyResource =
  | "marketPulse"
  | "narratives"
  | "news"
  | "categories"
  | "technicals"
  | "quotes"

type CmcProxyRequest = {
  resource: CmcProxyResource
  symbols?: string[]
}

type CmcProxyResponse<T> = {
  data?: T
  source?: "live" | "mock"
  warning?: string
}

async function invokeProxy<T>(body: CmcProxyRequest): Promise<T> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase não configurado para CoinMarketCap real data.")
  }

  const { data, error } = await supabase.functions.invoke<CmcProxyResponse<T>>(
    "coinmarketcap-proxy",
    {
      body,
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  if (data?.source === "mock") {
    throw new Error(data.warning ?? `CoinMarketCap proxy returned fallback data for ${body.resource}.`)
  }

  if (!data?.data) {
    throw new Error("Resposta inválida do proxy CoinMarketCap.")
  }

  return data.data
}

export function createRealCmcProvider(): CmcProvider {
  return {
    getMarketPulse() {
      return invokeProxy<CmcMarketPulseDto>({ resource: "marketPulse" })
    },
    getNarratives() {
      return invokeProxy<CmcNarrativeDto[]>({ resource: "narratives" })
    },
    getNews() {
      return invokeProxy<CmcNewsItemDto[]>({ resource: "news" })
    },
    getCategories() {
      return invokeProxy<CmcCategoryDto[]>({ resource: "categories" })
    },
    getTechnicals(symbols) {
      return invokeProxy<CmcTechnicalDto[]>({ resource: "technicals", symbols })
    },
    getQuotes(symbols) {
      return invokeProxy<CmcQuoteDto[]>({ resource: "quotes", symbols })
    },
  }
}

