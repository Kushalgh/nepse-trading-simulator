import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span className="text-xl font-bold">StockTrader Pro</span>
          </div>

          <nav className="flex gap-6">
            <Link
              href="/#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/#about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
          </nav>

          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StockTrader Pro. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
