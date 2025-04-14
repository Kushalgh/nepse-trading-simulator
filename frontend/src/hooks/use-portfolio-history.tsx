"use client";

import type { PortfolioHistoryEntry } from "@/types";
import { useState, useEffect } from "react";

export function usePortfolioHistory() {
  const [history, setHistory] = useState<PortfolioHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch this from the API
    // For demo purposes, we'll just set isLoading to false
    setIsLoading(false);
  }, []);

  return {
    history,
    isLoading,
  };
}
