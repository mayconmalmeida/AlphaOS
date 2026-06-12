export type SupportedLocale = "en" | "pt-BR" | "es"

export type TranslationTree = {
  [key: string]: string | TranslationTree
}

