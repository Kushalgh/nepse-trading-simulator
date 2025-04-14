"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import type { LeaderboardEntry } from "@/types";
import { motion } from "framer-motion";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
}

export function LeaderboardTable({
  leaderboard,
  isLoading,
}: LeaderboardTableProps) {
  const { user } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No leaderboard data available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>Trader</TableHead>
          <TableHead className="text-right">Portfolio Value</TableHead>
          <TableHead className="text-right">Profit %</TableHead>
          <TableHead className="text-right">Trades</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry, index) => {
          const isCurrentUser = user?.username === entry.username;

          return (
            <motion.tr
              key={index}
              className={`${isCurrentUser ? "bg-primary/5" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TableCell className="font-medium">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {entry.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className={isCurrentUser ? "font-bold" : ""}>
                    {entry.username}
                    {isCurrentUser && " (You)"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                ${entry.totalValue.toLocaleString()}
              </TableCell>
              <TableCell
                className={`text-right ${
                  entry.profitPercent > 0
                    ? "text-green-500"
                    : entry.profitPercent < 0
                    ? "text-red-500"
                    : ""
                }`}
              >
                {entry.profitPercent > 0 ? "+" : ""}
                {entry.profitPercent.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">{entry.tradeCount}</TableCell>
              <TableCell className="text-right font-medium">
                {Math.round(entry.score).toLocaleString()}
              </TableCell>
            </motion.tr>
          );
        })}
      </TableBody>
    </Table>
  );
}
