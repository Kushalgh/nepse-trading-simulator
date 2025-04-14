"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Achievement } from "@/types";
import { motion } from "framer-motion";
import { Award, CheckCircle, Medal, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const getIcon = () => {
    switch (achievement.name) {
      case "First Trade":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "Diversified Portfolio":
        return <TrendingUp className="h-6 w-6 text-blue-500" />;
      case "Profit Maker":
        return <Award className="h-6 w-6 text-yellow-500" />;
      case "Volume Trader":
        return <Medal className="h-6 w-6 text-purple-500" />;
      default:
        return <Award className="h-6 w-6 text-primary" />;
    }
  };

  const getLevelColor = () => {
    switch (achievement.level) {
      case "bronze":
        return "bg-amber-700/20 text-amber-700";
      case "silver":
        return "bg-slate-400/20 text-slate-400";
      case "gold":
        return "bg-yellow-500/20 text-yellow-500";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          {achievement.level && (
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getLevelColor()}`}
            >
              {achievement.level.charAt(0).toUpperCase() +
                achievement.level.slice(1)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-muted p-2">{getIcon()}</div>
            <div>
              <h3 className="font-medium">{achievement.name}</h3>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Earned {format(new Date(achievement.earnedAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
