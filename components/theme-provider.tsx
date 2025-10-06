"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    const themeClass = localStorage.getItem("color-theme")
    if (themeClass && themeClass !== "default") {
      document.documentElement.classList.add(`theme-${themeClass}`)
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
