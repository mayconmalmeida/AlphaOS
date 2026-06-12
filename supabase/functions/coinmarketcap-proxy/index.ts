const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type Resource =
  | "marketPulse"
  | "narratives"
  | "news"
  | "categories"
  | "technicals"
  | "quotes"

type RequestBody = {
  resource?: Resource
  symbols?: string[]
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    headers: corsHeaders,
    ...init,
  })
}

function buildMock(resource: Resource, symbols: string[] = []) {
  switch (resource) {
    case "marketPulse":
      return {
        data: {
          dominance: { btc_dominance: 53.2 },
          sentiment: { fear_greed: 62, sentiment_score: 0.58 },
          totals: { market_cap_usd: 2.78e12, volume_24h_usd: 1.12e11 },
          news_momentum: 0.64,
        },
        source: "mock",
      }
    case "narratives":
      return {
        data: [
          { name: "AI", strength: 86, velocity: 72, growth: 61, rotation_score: 68 },
          { name: "RWA", strength: 64, velocity: 58, growth: 52, rotation_score: 49 },
          { name: "DePIN", strength: 58, velocity: 55, growth: 48, rotation_score: 44 },
          { name: "Layer 2", strength: 55, velocity: 49, growth: 44, rotation_score: 46 },
          { name: "Memecoins", strength: 51, velocity: 39, growth: 33, rotation_score: 57 },
        ],
        source: "mock",
      }
    case "categories":
      return {
        data: [
          { name: "Infrastructure", strength: 74, rotation_score: 61 },
          { name: "AI", strength: 71, rotation_score: 58 },
          { name: "RWA", strength: 62, rotation_score: 49 },
          { name: "DePIN", strength: 57, rotation_score: 44 },
          { name: "Gaming", strength: 41, rotation_score: 29 },
        ],
        source: "mock",
      }
    case "news":
      return {
        data: [
          {
            id: "cmc-news-1",
            title: "Infrastructure narratives consolidate as liquidity narrows into leaders",
            source: "CoinMarketCap",
            published_at: new Date().toISOString(),
            sentiment_score: 0.14,
            summary: "Fluxo privilegia líderes com maior liquidez e menor dispersão.",
          },
        ],
        source: "mock",
      }
    case "technicals":
      return {
        data: (symbols.length > 0 ? symbols : ["BTC", "ETH", "SOL"]).map((symbol, index) => ({
          symbol,
          trend: index % 3 === 0 ? "bullish" : index % 3 === 1 ? "neutral" : "bearish",
          momentum: Number((0.55 + index * 0.05).toFixed(2)),
          volatility: Number((0.35 + index * 0.04).toFixed(2)),
        })),
        source: "mock",
      }
    case "quotes":
      return {
        data: (symbols.length > 0 ? symbols : ["BTC", "ETH", "SOL"]).map((symbol, index) => ({
          symbol,
          price_usd: 1000 * (index + 1),
          volume_24h_usd: 100000000 * (index + 2),
          market_cap_usd: 1000000000 * (index + 5),
        })),
        source: "mock",
      }
  }
}

async function cmcFetch(path: string, params: Record<string, string>) {
  const apiKey = Deno.env.get("CMC_API_KEY")
  const baseUrl = Deno.env.get("CMC_API_BASE_URL") ?? "https://pro-api.coinmarketcap.com"

  if (!apiKey) {
    throw new Error("CMC_API_KEY não configurada.")
  }

  const url = new URL(path, baseUrl)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-CMC_PRO_API_KEY": apiKey,
    },
  })

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After")
    throw new Error(
      `CoinMarketCap rate limit atingido.${retryAfter ? ` Retry-After: ${retryAfter}s.` : ""}`
    )
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`CoinMarketCap ${response.status}: ${text.slice(0, 240)}`)
  }

  return response.json()
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeMarketPulse(globalMetrics: any, fearGreed: any) {
  const data = globalMetrics?.data ?? {}
  return {
    dominance: {
      btc_dominance: toNumber(data.btc_dominance),
    },
    sentiment: {
      fear_greed: toNumber(fearGreed?.data?.value, 50),
      sentiment_score: Number((toNumber(fearGreed?.data?.value, 50) / 100).toFixed(2)),
    },
    totals: {
      market_cap_usd: toNumber(data.quote?.USD?.total_market_cap),
      volume_24h_usd: toNumber(data.quote?.USD?.total_volume_24h),
    },
    news_momentum: Number(
      (
        Math.min(
          1,
          Math.max(0, toNumber(data.quote?.USD?.total_volume_24h_yesterday_percentage_change, 0) / 100)
        ) || 0.5
      ).toFixed(2)
    ),
  }
}

function normalizeQuotes(payload: any, symbols: string[]) {
  const data = payload?.data ?? {}
  return symbols.map((symbol) => {
    const item = data[symbol]
    const usd = item?.quote?.USD ?? {}
    return {
      symbol,
      price_usd: toNumber(usd.price),
      volume_24h_usd: toNumber(usd.volume_24h),
      market_cap_usd: toNumber(usd.market_cap),
    }
  })
}

function normalizeNarratives(payload: any) {
  const items = Array.isArray(payload?.data) ? payload.data : []
  return items.slice(0, 8).map((item: any, index: number) => {
    const usd = item?.quote?.USD ?? {}
    const change24h = Math.abs(toNumber(usd.percent_change_24h))
    const change7d = Math.abs(toNumber(usd.percent_change_7d))
    return {
      name: String(item?.name ?? `Trend ${index + 1}`),
      strength: Math.min(100, Math.round(40 + toNumber(item?.cmc_rank ? 100 - item.cmc_rank : 40))),
      velocity: Math.min(100, Math.round(25 + change24h * 4)),
      growth: Math.min(100, Math.round(20 + change7d * 3)),
      rotation_score: Math.min(100, Math.round(30 + toNumber(usd.market_cap_dominance))),
    }
  })
}

function normalizeCategories(payload: any) {
  const items = Array.isArray(payload?.data) ? payload.data : []
  return items.slice(0, 8).map((item: any, index: number) => ({
    name: String(item?.name ?? `Category ${index + 1}`),
    strength: Math.min(100, Math.round(toNumber(item?.num_tokens, 20) + 20)),
    rotation_score: Math.min(
      100,
      Math.round(Math.abs(toNumber(item?.avg_price_change, toNumber(item?.avg_price_change_24h, 0))) * 5 + 25)
    ),
  }))
}

function normalizeNews(payload: any) {
  const items = Array.isArray(payload?.data) ? payload.data : []
  return items.slice(0, 8).map((item: any, index: number) => ({
    id: String(item?.id ?? `news-${index + 1}`),
    title: String(item?.title ?? item?.meta?.title ?? `CMC News ${index + 1}`),
    source: String(item?.source_name ?? item?.source ?? "CoinMarketCap"),
    published_at: String(item?.published_at ?? item?.created_at ?? new Date().toISOString()),
    sentiment_score: toNumber(item?.sentiment, 0),
    summary: String(item?.summary ?? item?.subtitle ?? ""),
  }))
}

function normalizeTechnicals(marketPairsPayload: any, quotesPayload: any, symbols: string[]) {
  const pairsData = marketPairsPayload?.data ?? {}
  const quotesData = quotesPayload?.data ?? {}

  return symbols.map((symbol, index) => {
    const quoteItem = quotesData[symbol]
    const usd = quoteItem?.quote?.USD ?? {}
    const pairs = Array.isArray(pairsData[symbol]?.data?.market_pairs)
      ? pairsData[symbol].data.market_pairs
      : []
    const volume = toNumber(usd.volume_24h)
    const change24h = toNumber(usd.percent_change_24h)
    const change7d = toNumber(usd.percent_change_7d)
    const volatility = Math.min(1, Math.abs(change24h) / 20 + Math.abs(change7d) / 40)
    const momentum = Math.min(1, Math.max(0, 0.45 + change24h / 100 + change7d / 150))
    const trend = change24h > 1 ? "bullish" : change24h < -1 ? "bearish" : "neutral"

    return {
      symbol,
      trend,
      momentum: Number(momentum.toFixed(2)),
      volatility: Number(volatility.toFixed(2)),
      market_pairs_count: pairs.length,
      volume_24h_usd: volume,
      index,
    }
  }).map(({ market_pairs_count: _count, volume_24h_usd: _volume, index: _index, ...rest }) => rest)
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = (await request.json()) as RequestBody
    const resource = body.resource
    const symbols = (body.symbols ?? ["BTC", "ETH", "SOL"]).map((item) => item.toUpperCase())

    if (!resource) {
      return json({ error: "resource is required" }, { status: 400 })
    }

    try {
      switch (resource) {
        case "marketPulse": {
          const [globalMetrics, fearGreed] = await Promise.all([
            cmcFetch("/v1/global-metrics/quotes/latest", { convert: "USD" }),
            cmcFetch("/v3/fear-and-greed/latest", {}),
          ])
          return json({ data: normalizeMarketPulse(globalMetrics, fearGreed), source: "live" })
        }
        case "quotes": {
          const quotes = await cmcFetch("/v3/cryptocurrency/quotes/latest", {
            symbol: symbols.join(","),
            convert: "USD",
            skip_invalid: "1",
          })
          return json({ data: normalizeQuotes(quotes, symbols), source: "live" })
        }
        case "narratives": {
          const trending = await cmcFetch("/v1/cryptocurrency/trending/latest", {
            limit: "8",
            convert: "USD",
          })
          return json({ data: normalizeNarratives(trending), source: "live" })
        }
        case "categories": {
          const categories = await cmcFetch("/v1/cryptocurrency/categories", {
            limit: "8",
          })
          return json({ data: normalizeCategories(categories), source: "live" })
        }
        case "news": {
          const news = await cmcFetch("/v1/content/latest", {
            limit: "8",
          })
          return json({ data: normalizeNews(news), source: "live" })
        }
        case "technicals": {
          const quotes = await cmcFetch("/v3/cryptocurrency/quotes/latest", {
            symbol: symbols.join(","),
            convert: "USD",
            skip_invalid: "1",
          })

          const marketPairsEntries = await Promise.all(
            symbols.map(async (symbol) => {
              try {
                const payload = await cmcFetch("/v1/cryptocurrency/market_pairs/latest", {
                  symbol,
                  convert: "USD",
                })
                return [symbol, payload]
              } catch {
                return [symbol, { data: { market_pairs: [] } }]
              }
            })
          )
          const marketPairs = Object.fromEntries(marketPairsEntries)

          return json({
            data: normalizeTechnicals({ data: marketPairs }, quotes, symbols),
            source: "live",
          })
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "CoinMarketCap proxy failed"
      return json({ ...buildMock(resource, symbols), warning: message }, { status: 200 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected proxy error"
    return json({ error: message }, { status: 500 })
  }
})

