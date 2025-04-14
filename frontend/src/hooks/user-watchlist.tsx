"use client";
import { useStocks } from "./use-stocks";

export function useWatchlist() {
  const { stocks, isLoading, isError } = useStocks();

  // In a real app, you would fetch the user's watchlist from the API
  // For demo purposes, we'll just return the first 5 stocks
  const watchlist = stocks?.slice(0, 5) || [];

  return {
    watchlist,
    isLoading,
    isError,
  };
}
