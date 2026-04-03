import { createContext } from 'react'

export type Lang = 'de' | 'en'

export interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const LangContext = createContext<LangCtx>({
  lang: 'de',
  setLang: () => {},
  t: (key) => key
})
