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
import { useToast } from "@/hooks/use-toast";
import { usePendingOrders } from "@/hooks/use-pending-orders";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function PendingOrders() {
  const { pendingOrders, isLoading, mutate } = usePendingOrders();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCancelOrder = async (id: string) => {
    setCancellingId(id);
    try {
      await api.delete(`/trade/pending/${id}`);
      toast({
        title: "Order cancelled",
        description: "Your pending order has been cancelled successfully.",
      });
      mutate();
    } catch (error: any) {
      toast({
        title: "Failed to cancel order",
        description:
          error.message || "An error occurred while cancelling your order.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          You don&apos;t have any pending orders
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stock</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Action</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Limit Price</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.stock.symbol}</TableCell>
            <TableCell>{order.type}</TableCell>
            <TableCell>
              <span
                className={
                  order.action === "buy" ? "text-green-500" : "text-red-500"
                }
              >
                {order.action.charAt(0).toUpperCase() + order.action.slice(1)}
              </span>
            </TableCell>
            <TableCell className="text-right">{order.quantity}</TableCell>
            <TableCell className="text-right">
              ${order.limitPrice.toFixed(2)}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelOrder(order.id)}
                disabled={cancellingId === order.id}
              >
                {cancellingId === order.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
