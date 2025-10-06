"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode, useEffect } from "react";

type Locale = "tr" | "en";
type Dictionary = Record<string, string>;

const I18nContext = createContext<{ locale: Locale; t: (k: string) => string; setLocale: (l: Locale) => void }>({
  locale: "tr",
  t: (k) => k,
  setLocale: () => {},
});

export function I18nProvider({ children, dictionaries }: { children: ReactNode; dictionaries: Record<Locale, Dictionary> }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("locale") as Locale | null) : null;
    if (saved === "tr" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("locale", l);
  }, []);

  const t = useCallback(
    (k: string) => {
      const dict = dictionaries[locale] || {};
      return dict[k] ?? k;
    },
    [locale, dictionaries]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}


