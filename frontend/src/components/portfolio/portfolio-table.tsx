"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PortfolioStock } from "@/types";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Link from "next/link";

interface PortfolioTableProps {
  portfolio: PortfolioStock[];
  isLoading: boolean;
}

export function PortfolioTable({ portfolio, isLoading }: PortfolioTableProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="mb-4 text-muted-foreground">
          You don&apos;t have any stocks in your portfolio yet.
        </p>
        <Link href="/trade">
          <Button>Start Trading</Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Avg. Buy Price</TableHead>
          <TableHead className="text-right">Current Price</TableHead>
          <TableHead className="text-right">Current Value</TableHead>
          <TableHead className="text-right">Gain/Loss</TableHead>
          <TableHead className="text-right">Gain/Loss %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {portfolio.map((stock) => (
          <TableRow key={stock.symbol}>
            <TableCell className="font-medium">{stock.symbol}</TableCell>
            <TableCell className="text-right">{stock.quantity}</TableCell>
            <TableCell className="text-right">
              ${stock.avgBuyPrice.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              ${stock.currentPrice.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              ${stock.currentValue.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end">
                {stock.gainLoss > 0 ? (
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                ) : stock.gainLoss < 0 ? (
                  <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                ) : (
                  <Minus className="mr-1 h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={
                    stock.gainLoss > 0
                      ? "text-green-500"
                      : stock.gainLoss < 0
                      ? "text-red-500"
                      : ""
                  }
                >
                  ${Math.abs(stock.gainLoss).toLocaleString()}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <span
                className={
                  stock.gainLossPercent > 0
                    ? "text-green-500"
                    : stock.gainLossPercent < 0
                    ? "text-red-500"
                    : ""
                }
              >
                {stock.gainLossPercent > 0 ? "+" : ""}
                {stock.gainLossPercent.toFixed(2)}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
