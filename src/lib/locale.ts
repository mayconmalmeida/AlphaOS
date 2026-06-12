import type { SupportedLocale } from "@/i18n/types"

export const DEFAULT_LOCALE: SupportedLocale = "en"
export const LOCALE_STORAGE_KEY = "alphaos.locale"

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return value === "en" || value === "pt-BR" || value === "es"
}

export function getStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return isSupportedLocale(saved) ? saved : DEFAULT_LOCALE
}

export function setStoredLocale(locale: SupportedLocale) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

