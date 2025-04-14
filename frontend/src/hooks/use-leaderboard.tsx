"use client";

import { api } from "@/lib/api";
import type { LeaderboardEntry } from "@/types";
import useSWR from "swr";

export function useLeaderboard() {
  const { data, error, isLoading, mutate } = useSWR<LeaderboardEntry[]>(
    "/gamification/leaderboard",
    api.fetcher
  );

  return {
    leaderboard: data,
    isLoading,
    isError: error,
    mutate,
  };
}
