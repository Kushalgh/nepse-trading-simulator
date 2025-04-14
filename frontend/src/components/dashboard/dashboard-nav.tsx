"use client";

import { cn } from "@/lib/utils";
import {
  Award,
  BarChart3,
  Home,
  LineChart,
  LogOut,
  Settings,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth-context";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: BarChart3,
  },
  {
    title: "Trade",
    href: "/trade",
    icon: TrendingUp,
  },
  {
    title: "Achievements",
    href: "/achievements",
    icon: Award,
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: LineChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface DashboardNavProps {
  className?: string;
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className={cn("grid items-start gap-2", className)}>
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href && "bg-primary text-primary-foreground"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
      <Button variant="ghost" className="w-full justify-start" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </nav>
  );
}
