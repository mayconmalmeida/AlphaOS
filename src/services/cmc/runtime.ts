export type CmcCapability =
  | "quotes"
  | "technicals"
  | "news"
  | "sentiment"
  | "categories"
  | "narratives"

export type CmcCapabilityStatus = {
  capability: CmcCapability
  source: "live" | "fallback" | "cache" | "idle"
  endpoint: string
  lastChecked: string | null
  lastSync: string | null
  message: string
  retryCount: number
}

type RuntimeState = Record<CmcCapability, CmcCapabilityStatus>
export type CmcRuntimeSnapshot = RuntimeState

const DEFAULT_STATE: RuntimeState = {
  quotes: {
    capability: "quotes",
    source: "idle",
    endpoint: "quotes",
    lastChecked: null,
    lastSync: null,
    message: "Awaiting first fetch.",
    retryCount: 0,
  },
  technicals: {
    capability: "technicals",
    source: "idle",
    endpoint: "technicals",
    lastChecked: null,
    lastSync: null,
    message: "Awaiting first fetch.",
    retryCount: 0,
  },
  news: {
    capability: "news",
    source: "idle",
    endpoint: "news",
    lastChecked: null,
    lastSync: null,
    message: "Awaiting first fetch.",
    retryCount: 0,
  },
  sentiment: {
    capability: "sentiment",
    source: "idle",
    endpoint: "marketPulse",
    lastChecked: null,
    lastSync: null,
    message: "Awaiting first fetch.",
    retryCount: 0,
  },
  categories: {
    capability: "categories",
    source: "idle",
    endpoint: "categories",
    lastChecked: null,
    lastSync: null,
    message: "Awaiting first fetch.",
    retryCount: 0,
  },
  narratives: {
    capability: "narratives",
    source: "idle",
    endpoint: "narratives",
    lastChecked: null,
    lastSync: null,
    message: "Awaiting first fetch.",
    retryCount: 0,
  },
}

const runtimeState: RuntimeState = { ...DEFAULT_STATE }

function nowIso() {
  return new Date().toISOString()
}

export function recordCmcCapabilityStatus(
  capability: CmcCapability,
  update: Partial<Omit<CmcCapabilityStatus, "capability">>
) {
  runtimeState[capability] = {
    ...runtimeState[capability],
    ...update,
    capability,
    lastChecked: update.lastChecked ?? nowIso(),
  }
}

export function getCmcRuntimeStatus(capability: CmcCapability): CmcCapabilityStatus
export function getCmcRuntimeStatus(): CmcRuntimeSnapshot
export function getCmcRuntimeStatus(capability?: CmcCapability) {
  if (capability) return runtimeState[capability]
  return { ...runtimeState }
}
