"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        className={`px-2 py-1 rounded border ${locale === "tr" ? "bg-primary text-primary-foreground" : ""}`}
        onClick={() => setLocale("tr")}
      >TR</button>
      <button
        className={`px-2 py-1 rounded border ${locale === "en" ? "bg-primary text-primary-foreground" : ""}`}
        onClick={() => setLocale("en")}
      >EN</button>
    </div>
  );
}


