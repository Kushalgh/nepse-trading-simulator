"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function LandingHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <span className="text-xl font-bold">StockTrader Pro</span>
        </div>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/#features"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Pricing
          </Link>
          <Link
            href="/#about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
