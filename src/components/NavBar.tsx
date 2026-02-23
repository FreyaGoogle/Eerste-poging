"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/locatie-checks", label: "LocatieChecks" },
  { href: "/bronnen", label: "Bronnen" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 h-14">
          <Link href="/" className="font-bold text-blue-700 text-base whitespace-nowrap">
            WelzijnCheck v5
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto text-xs text-gray-400">
            IJKKADER v5 + BOM + Hospitality
          </div>
        </div>
      </div>
    </header>
  );
}
