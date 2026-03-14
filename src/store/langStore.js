import { create } from 'zustand'

const useLangStore = create((set) => ({
  lang: localStorage.getItem('mi-economia-lang') || 'es',
  setLang: (lang) => {
    localStorage.setItem('mi-economia-lang', lang)
    set({ lang })
  },
}))

export default useLangStore
