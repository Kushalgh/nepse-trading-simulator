"use client";

import { api } from "@/lib/api";
import type { OrderBook } from "@/types";
import useSWR from "swr";

export function useOrderBook(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR<OrderBook>(
    symbol ? `/stocks/${symbol}/order-book` : null,
    api.fetcher
  );

  return {
    orderBook: data,
    isLoading,
    isError: error,
    mutate,
  };
}
