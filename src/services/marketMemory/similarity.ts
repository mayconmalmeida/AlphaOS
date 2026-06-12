function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function hashStringToUnit(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

export function mockEmbeddingVector(seed: string, dims = 32) {
  const base = hashStringToUnit(seed)
  return Array.from({ length: dims }).map((_, i) =>
    clamp01((base * 0.7 + hashStringToUnit(`${seed}:${i}`) * 0.3) * 1.02)
  )
}

export function cosineSimilarity(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length)
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < len; i++) {
    const av = a[i]
    const bv = b[i]
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  if (denom === 0) return 0
  return clamp01(dot / denom)
}

