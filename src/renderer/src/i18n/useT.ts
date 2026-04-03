import { useContext } from 'react'
import { LangContext } from './context'

export function useT() {
  return useContext(LangContext)
}
