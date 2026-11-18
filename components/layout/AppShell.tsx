"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
