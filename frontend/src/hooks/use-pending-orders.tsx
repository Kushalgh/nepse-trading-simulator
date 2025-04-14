"use client";

import { api } from "@/lib/api";
import type { PendingOrder } from "@/types";
import useSWR from "swr";

export function usePendingOrders() {
  const { data, error, isLoading, mutate } = useSWR<PendingOrder[]>(
    "/trade/pending",
    api.fetcher
  );

  return {
    pendingOrders: data,
    isLoading,
    isError: error,
    mutate,
  };
}
