import type React from "react";
import { cn } from "@/lib/utils";
import { DashboardNav } from "./dashboard-nav";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6">
            <DashboardNav />
          </div>
        </aside>
        <main className={cn("flex w-full flex-col overflow-hidden", className)}>
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
