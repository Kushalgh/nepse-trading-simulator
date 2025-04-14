"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types";
import { ArrowDown, ArrowUp, Minus, Search } from "lucide-react";
import { useState } from "react";

interface StockListProps {
  stocks: Stock[];
  isLoading: boolean;
  onSelectStock: (symbol: string) => void;
  selectedStock: string | null;
}

export function StockList({
  stocks,
  isLoading,
  onSelectStock,
  selectedStock,
}: StockListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md p-2"
                >
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[80px]" />
                </div>
              ))}
          </div>
        ) : filteredStocks.length > 0 ? (
          <div className="space-y-1">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors",
                  selectedStock === stock.symbol
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectStock(stock.symbol)}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "mr-2 rounded p-1",
                      selectedStock === stock.symbol
                        ? "bg-primary-foreground/20"
                        : "bg-muted"
                    )}
                  >
                    {stock.trend === "up" ? (
                      <ArrowUp
                        className={cn(
                          "h-3 w-3",
                          selectedStock === stock.symbol
                            ? "text-primary-foreground"
                            : "text-green-500"
                        )}
                      />
                    ) : stock.trend === "down" ? (
                      <ArrowDown
                        className={cn(
                          "h-3 w-3",
                          selectedStock === stock.symbol
                            ? "text-primary-foreground"
                            : "text-red-500"
                        )}
                      />
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm font-medium">{stock.symbol}</div>
                </div>
                <div className="text-right text-sm">
                  ${stock.ltp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              No stocks found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
