"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { PortfolioTable } from "@/components/portfolio/portfolio-table";
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
import { ArrowUpRight, Download, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const { user } = useAuth();
  const { portfolio, isLoading } = usePortfolio();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access your portfolio
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
        heading="Portfolio"
        text="View and manage your stock holdings."
      >
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/trade">
            <Button>
              <TrendingUp className="mr-2 h-4 w-4" />
              Trade
            </Button>
          </Link>
        </div>
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
            {isLoading ? (
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
            {isLoading ? (
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
            {isLoading ? (
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
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                ${portfolio?.totalInvested.toLocaleString() || "0.00"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Your portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>
            A detailed view of your stock holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioTable
            portfolio={portfolio?.portfolio || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
