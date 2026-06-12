import { useEffect, useState } from "react"

const STORAGE_KEY = "alphaos.demo-mode"

export function useDemoMode() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? saved === "true" : true
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, String(enabled))
  }, [enabled])

  return {
    enabled,
    toggle: () => setEnabled((current) => !current),
    setEnabled,
  }
}

