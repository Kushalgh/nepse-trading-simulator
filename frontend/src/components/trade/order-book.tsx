"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrderBook } from "@/hooks/use-order-book";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface OrderBookProps {
  symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  const { orderBook, isLoading } = useOrderBook(symbol);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Buy Orders</h3>
          <Skeleton className="h-32 w-full" />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Sell Orders</h3>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (
    !orderBook ||
    (!orderBook.buyOrders.length && !orderBook.sellOrders.length)
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          No orders in the order book for {symbol}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 flex items-center text-sm font-medium">
          <ArrowDownLeft className="mr-1 h-4 w-4 text-green-500" />
          Buy Orders
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderBook.buyOrders.length > 0 ? (
              orderBook.buyOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    ${order.limitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(order.limitPrice * order.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No buy orders
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="mb-2 flex items-center text-sm font-medium">
          <ArrowUpRight className="mr-1 h-4 w-4 text-red-500" />
          Sell Orders
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderBook.sellOrders.length > 0 ? (
              orderBook.sellOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    ${order.limitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(order.limitPrice * order.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No sell orders
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
