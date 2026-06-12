import en from "@/i18n/messages/en"
import es from "@/i18n/messages/es"
import ptBR from "@/i18n/messages/pt-BR"
import type { SupportedLocale, TranslationTree } from "@/i18n/types"

export const staticMessages: Record<SupportedLocale, TranslationTree> = {
  en,
  "pt-BR": ptBR,
  es,
}

export async function loadMessages(locale: SupportedLocale): Promise<TranslationTree> {
  switch (locale) {
    case "pt-BR":
      return (await import("@/i18n/messages/pt-BR")).default
    case "es":
      return (await import("@/i18n/messages/es")).default
    case "en":
    default:
      return (await import("@/i18n/messages/en")).default
  }
}

