import { useState, type ReactNode } from 'react'
import { LangContext, type Lang } from './context'
import de from './de.json'
import en from './en.json'

export type { Lang } from './context'

type Translations = typeof de

const translations: Record<Lang, Translations> = { de, en }

function resolve(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return key
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : key
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang')
    return stored === 'en' || stored === 'de' ? stored : 'de'
  })

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    let str = resolve(translations[lang] as Record<string, unknown>, key)
    if (str === key) str = resolve(translations['de'] as Record<string, unknown>, key)
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}
