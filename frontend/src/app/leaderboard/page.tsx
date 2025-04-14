"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Award } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const { leaderboard, isLoading } = useLeaderboard();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Leaderboard"
        text="See how you rank against other traders."
      >
        <Link href="/achievements">
          <Button variant="outline">
            <Award className="mr-2 h-4 w-4" />
            Achievements
          </Button>
        </Link>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Top Traders</CardTitle>
          <CardDescription>
            Ranked by portfolio value, profit percentage, and trade count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardTable
            leaderboard={leaderboard || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
