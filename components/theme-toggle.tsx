'use client'

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const themes = [
  { name: "Varsayılan", id: "default", color: "#9ca3af" },
  { name: "Mavi", id: "blue", color: "#3b82f6" },
  { name: "Mor", id: "purple", color: "#8b5cf6" },
  { name: "Yeşil", id: "green", color: "#10b981" },
  { name: "Pembe", id: "rose", color: "#e11d48" },
  { name: "Turuncu", id: "amber", color: "#f59e0b" },
]

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = React.useState<string>("default")
  const [mode, setMode] = React.useState<"light" | "dark" | "system">("light")

  React.useEffect(() => {
    const savedMode = (window.localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system") || "light"
    const savedColorTheme = window.localStorage.getItem("color-theme") || "default"

    setMode(savedMode)
    setCurrentTheme(savedColorTheme)

    if (savedColorTheme && savedColorTheme !== "default") {
      document.documentElement.classList.add(`theme-${savedColorTheme}`)
    }
  }, [])

  const setColorTheme = (themeId: string) => {
    document.documentElement.classList.remove(...themes.map((t) => `theme-${t.id}`))
    if (themeId !== "default") {
      document.documentElement.classList.add(`theme-${themeId}`)
    }
    localStorage.setItem("color-theme", themeId)
    setCurrentTheme(themeId)
  }

  const handleThemeChange = (newMode: "light" | "dark" | "system") => {
    setTheme(newMode)
    setMode(newMode)
  }

  const ColorSwatch = ({ color, active }: { color: string; active: boolean }) => (
    <div
      className={cn(
        "h-5 w-5 rounded-full border border-border",
        active && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: color }}
    />
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Tema değiştir">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Temayı değiştir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleThemeChange("light")} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Açık</span>
          </div>
          {mode === "light" && <span className="text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Koyu</span>
          </div>
          {mode === "dark" && <span className="text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Sistem</span>
          </div>
          {mode === "system" && <span className="text-primary">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center">
            <Palette className="mr-2 h-4 w-4" />
            <span>Renk Teması</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {themes.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex items-center gap-2 p-2 cursor-pointer" onClick={() => setColorTheme(item.id)}>
                    <ColorSwatch color={item.color} active={currentTheme === item.id} />
                    <span className={cn("text-sm", currentTheme === item.id && "font-medium")}>
                      {item.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


