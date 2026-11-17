"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Layers,
  BarChart3,
  Network,
  Timer,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/quiz", label: "Quiz IA", icon: Zap },
  { href: "/examen", label: "Examen blanc", icon: Timer },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/mindmaps", label: "خطاطات", icon: Network },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 h-screen flex flex-col shrink-0">
      <div className="p-4 lg:p-6 border-b border-slate-800">
        <Link href="/">
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            🎓 <span className="hidden lg:inline">Hub 3AC</span>
          </h1>
        </Link>
      </div>
      <nav className="flex-1 p-2 lg:p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={
                "flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition " +
                (active
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "hover:bg-slate-800 text-slate-300")
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className="hidden lg:inline font-medium text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
