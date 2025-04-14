"use client";
import type { Transaction } from "@/types";

export function useTransactions() {
  // In a real app, you would fetch this from the API
  // For demo purposes, we'll mock some data
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      userId: "user1",
      stockId: "stock1",
      quantity: 10,
      price: 150.25,
      fee: 6.01,
      totalAmount: 1508.51,
      action: "buy",
      createdAt: new Date().toISOString(),
      stock: {
        symbol: "AAPL",
        name: "Apple Inc.",
      },
    },
    {
      id: "2",
      userId: "user1",
      stockId: "stock2",
      quantity: 5,
      price: 320.5,
      fee: 6.41,
      totalAmount: 1609.09,
      action: "buy",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      stock: {
        symbol: "MSFT",
        name: "Microsoft Corporation",
      },
    },
    {
      id: "3",
      userId: "user1",
      stockId: "stock1",
      quantity: 3,
      price: 155.75,
      fee: 1.87,
      totalAmount: 465.38,
      action: "sell",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      stock: {
        symbol: "AAPL",
        name: "Apple Inc.",
      },
    },
  ];

  return {
    transactions: mockTransactions,
    isLoading: false,
    isError: null,
  };
}
