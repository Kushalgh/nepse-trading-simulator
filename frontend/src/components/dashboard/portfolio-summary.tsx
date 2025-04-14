import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PortfolioStock } from "@/types";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Link from "next/link";

interface PortfolioSummaryProps {
  portfolio: PortfolioStock[];
  isLoading: boolean;
  className?: string;
}

export function PortfolioSummary({
  portfolio,
  isLoading,
  className,
}: PortfolioSummaryProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
        <CardDescription>Your current stock holdings</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[80px]" />
                </div>
              ))}
          </div>
        ) : portfolio.length > 0 ? (
          <div className="space-y-4">
            {portfolio.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="mr-2 rounded bg-muted p-1">
                    {stock.gainLossPercent > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : stock.gainLossPercent < 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {stock.quantity} shares @ ${stock.avgBuyPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${stock.currentValue.toLocaleString()}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      stock.gainLossPercent > 0
                        ? "text-green-500"
                        : stock.gainLossPercent < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {stock.gainLossPercent > 0 ? "+" : ""}
                    {stock.gainLossPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <Link
                href="/portfolio"
                className="text-sm font-medium text-primary hover:underline"
              >
                View full portfolio
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-muted-foreground">
              You don&apos;t have any stocks in your portfolio yet.
            </p>
            <Link
              href="/trade"
              className="text-sm font-medium text-primary hover:underline"
            >
              Start trading
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
