"use client";

import { AchievementCard } from "@/components/achievements/achievement-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useAchievements } from "@/hooks/use-achievements";
import { Award, Trophy } from "lucide-react";
import Link from "next/link";

export default function AchievementsPage() {
  const { user } = useAuth();
  const { achievements, isLoading } = useAchievements();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to view your achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Achievements"
        text="Track your progress and unlock rewards as you trade."
      >
        <Link href="/leaderboard">
          <Button variant="outline">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </Link>
      </DashboardHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : achievements && achievements.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Award className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No Achievements Yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start trading to earn your first achievement!
            </p>
            <Link href="/trade">
              <Button>Start Trading</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
