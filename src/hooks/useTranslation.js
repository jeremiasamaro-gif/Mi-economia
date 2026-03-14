import useLangStore from '../store/langStore'
import { translations } from '../lib/i18n'

export function useTranslation() {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)

  const t = (key, replacements) => {
    let text = translations[lang]?.[key] || translations.es[key] || key
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }

  return { t, lang, setLang }
}
