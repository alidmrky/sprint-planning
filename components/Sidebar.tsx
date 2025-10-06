"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

const items = [
  { href: "/planlama", label: "Planlama" },
  { href: "/sprintler", label: "Sprintler" },
  { href: "/konfigurasyonlar", label: "Konfigürasyonlar" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="h-full w-64 border-r bg-card/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Menü</div>
        <LanguageSwitcher />
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


