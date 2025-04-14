"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioHistory } from "@/hooks/use-portfolio-history";
import { motion } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function PortfolioChart() {
  const { history, isLoading } = usePortfolioHistory();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground">No portfolio history available</p>
      </div>
    );
  }

  // For demo purposes, we'll generate some sample data
  // In a real app, this would come from the API
  const sampleData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));

    // Generate a somewhat realistic portfolio value curve
    const baseValue = 1000000;
    const randomFactor =
      Math.sin(i / 5) * 50000 + (Math.random() - 0.5) * 20000;
    const value = baseValue + randomFactor + i * 5000;

    return {
      date: date.toISOString().split("T")[0],
      value: value,
    };
  });

  return (
    <motion.div
      className="h-[300px] w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sampleData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              "Portfolio Value",
            ]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
