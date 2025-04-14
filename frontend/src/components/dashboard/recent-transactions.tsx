import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/types";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your recent trading activity</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center space-x-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    transaction.action === "buy" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {transaction.action === "buy" ? (
                    <ArrowDownLeft className={`h-6 w-6 text-green-600`} />
                  ) : (
                    <ArrowUpRight className={`h-6 w-6 text-red-600`} />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.action === "buy" ? "Bought" : "Sold"}{" "}
                    {transaction.quantity} {transaction.stock.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ${transaction.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @ ${transaction.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <Link
                href="/transactions"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all transactions
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-muted-foreground">
              You haven&apos;t made any transactions yet.
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
