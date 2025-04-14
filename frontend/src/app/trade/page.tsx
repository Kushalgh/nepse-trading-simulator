"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StockList } from "@/components/trade/stock-list";
import { TradeForm } from "@/components/trade/trade-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useStocks } from "@/hooks/use-stocks";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderBook } from "@/components/trade/order-book";
import { PendingOrders } from "@/components/trade/pending-orders";

export default function TradePage() {
  const { user } = useAuth();
  const { stocks, isLoading: stocksLoading } = useStocks();
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access the trading platform
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
        heading="Trade"
        text="Buy and sell stocks, place limit orders, and view your pending orders."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Stocks</CardTitle>
            <CardDescription>Select a stock to trade</CardDescription>
          </CardHeader>
          <CardContent>
            <StockList
              stocks={stocks || []}
              isLoading={stocksLoading}
              onSelectStock={setSelectedStock}
              selectedStock={selectedStock}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Trading Panel</CardTitle>
            <CardDescription>
              {selectedStock
                ? `Trading ${selectedStock}`
                : "Select a stock to start trading"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStock ? (
              <Tabs defaultValue="market">
                <TabsList className="mb-4">
                  <TabsTrigger value="market">Market Order</TabsTrigger>
                  <TabsTrigger value="limit">Limit Order</TabsTrigger>
                  <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                </TabsList>
                <TabsContent value="market">
                  <TradeForm
                    type="market"
                    symbol={selectedStock}
                    cashBalance={portfolio?.cashBalance || 0}
                    portfolio={portfolio?.portfolio || []}
                  />
                </TabsContent>
                <TabsContent value="limit">
                  <TradeForm
                    type="limit"
                    symbol={selectedStock}
                    cashBalance={portfolio?.cashBalance || 0}
                    portfolio={portfolio?.portfolio || []}
                  />
                </TabsContent>
                <TabsContent value="orderbook">
                  <OrderBook symbol={selectedStock} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                Select a stock from the list to start trading
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
          <CardDescription>Your active limit orders</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingOrders />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
