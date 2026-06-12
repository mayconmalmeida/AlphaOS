import type { SupportedLocale } from "@/i18n/types"
import { useI18n } from "@/i18n/I18nProvider"

const OPTIONS: Array<{ value: SupportedLocale; labelKey: string }> = [
  { value: "en", labelKey: "languageSwitcher.en" },
  { value: "pt-BR", labelKey: "languageSwitcher.ptBR" },
  { value: "es", labelKey: "languageSwitcher.es" },
]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <label className="hidden items-center gap-2 rounded-md border bg-card/50 px-3 py-2 text-xs text-muted-foreground md:flex">
      <span>{t("common.language", "Language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as SupportedLocale)}
        className="bg-transparent text-foreground outline-none"
        aria-label={t("common.language", "Language")}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey, option.value)}
          </option>
        ))}
      </select>
    </label>
  )
}

