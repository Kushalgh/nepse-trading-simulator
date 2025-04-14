"use client";

import { api } from "@/lib/api";
import type { Stock } from "@/types";
import useSWR from "swr";

export function useStocks() {
  const { data, error, isLoading, mutate } = useSWR<Stock[]>(
    "/stocks",
    api.fetcher
  );

  return {
    stocks: data,
    isLoading,
    isError: error,
    mutate,
  };
}
