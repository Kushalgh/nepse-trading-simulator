"use client";

import { api } from "@/lib/api";
import type { Achievement } from "@/types";
import useSWR from "swr";

export function useAchievements() {
  const { data, error, isLoading, mutate } = useSWR<Achievement[]>(
    "/gamification/achievements",
    api.fetcher
  );

  return {
    achievements: data,
    isLoading,
    isError: error,
    mutate,
  };
}
