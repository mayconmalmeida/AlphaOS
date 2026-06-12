import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { demoBuild } from "@/config/demoBuild"
import { loadMessages } from "@/i18n/catalog"
import type { SupportedLocale, TranslationTree } from "@/i18n/types"
import { DEFAULT_LOCALE, getStoredLocale, setStoredLocale } from "@/lib/locale"

type I18nContextValue = {
  locale: SupportedLocale
  messages: TranslationTree
  ready: boolean
  setLocale: (locale: SupportedLocale) => void
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function lookupMessage(messages: TranslationTree, key: string): string | null {
  const parts = key.split(".")
  let current: string | TranslationTree | undefined = messages

  for (const part of parts) {
    if (!current || typeof current === "string") return null
    current = current[part]
  }

  return typeof current === "string" ? current : null
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    demoBuild.englishOnly ? demoBuild.locale : DEFAULT_LOCALE
  )
  const [messages, setMessages] = useState<TranslationTree>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocaleState(demoBuild.englishOnly ? demoBuild.locale : getStoredLocale())
  }, [])

  useEffect(() => {
    let active = true
    setReady(false)
    loadMessages(locale).then((next) => {
      if (!active) return
      setMessages(next)
      setReady(true)
    })
    return () => {
      active = false
    }
  }, [locale])

  const setLocale = useCallback((next: SupportedLocale) => {
    if (demoBuild.englishOnly) {
      setLocaleState(demoBuild.locale)
      return
    }
    setStoredLocale(next)
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (key: string, fallback?: string) => lookupMessage(messages, key) ?? fallback ?? key,
    [messages]
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages,
      ready,
      setLocale,
      t,
    }),
    [locale, messages, ready, setLocale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

