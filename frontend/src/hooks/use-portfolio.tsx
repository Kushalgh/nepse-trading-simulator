"use client";

import { api } from "@/lib/api";
import type { Portfolio } from "@/types";
import useSWR from "swr";

export function usePortfolio() {
  const { data, error, isLoading, mutate } = useSWR<Portfolio>(
    "/portfolio",
    api.fetcher
  );

  return {
    portfolio: data,
    isLoading,
    isError: error,
    mutate,
  };
}
