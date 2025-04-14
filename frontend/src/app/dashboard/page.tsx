"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { StockWatchlist } from "@/components/dashboard/stock-watchlist";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useTransactions } from "@/hooks/use-transactions";
import { useWatchlist } from "@/hooks/use-watchlist";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your portfolio."
      >
        <Link href="/trade">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Trade Now
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Value
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfolioLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                ${portfolio?.totalValue.toLocaleString() || "0.00"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfolioLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                ${portfolio?.cashBalance.toLocaleString() || "0.00"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gain/Loss
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfolioLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div
                className={`text-2xl font-bold ${
                  portfolio?.totalGainLoss >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {portfolio?.totalGainLoss >= 0 ? "+" : ""}$
                {Math.abs(portfolio?.totalGainLoss || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invested
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfolioLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                ${portfolio?.totalInvested.toLocaleString() || "0.00"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PortfolioSummary
          portfolio={portfolio?.portfolio || []}
          isLoading={portfolioLoading}
          className="col-span-4"
        />
        <StockWatchlist
          watchlist={watchlist || []}
          isLoading={watchlistLoading}
          className="col-span-3"
        />
      </div>

      <RecentTransactions
        transactions={transactions || []}
        isLoading={transactionsLoading}
      />
    </DashboardShell>
  );
}
