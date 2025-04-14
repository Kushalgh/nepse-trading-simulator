import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types";
import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import Link from "next/link";

interface StockWatchlistProps {
  watchlist: Stock[];
  isLoading: boolean;
  className?: string;
}

export function StockWatchlist({
  watchlist,
  isLoading,
  className,
}: StockWatchlistProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Stocks you&apos;re monitoring</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
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
        ) : watchlist.length > 0 ? (
          <div className="space-y-4">
            {watchlist.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="mr-2 rounded bg-muted p-1">
                    {stock.trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : stock.trend === "down" ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {stock.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${stock.ltp.toLocaleString()}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      stock.change && stock.change > 0
                        ? "text-green-500"
                        : stock.change && stock.change < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {stock.change && stock.change > 0 ? "+" : ""}
                    {stock.change?.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <Link
                href="/trade"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all stocks
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-muted-foreground">
              You haven&apos;t added any stocks to your watchlist yet.
            </p>
            <Link
              href="/trade"
              className="text-sm font-medium text-primary hover:underline"
            >
              Browse stocks
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
