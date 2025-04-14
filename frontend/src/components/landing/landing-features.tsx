"use client";

import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Clock,
  LineChart,
  Shield,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time Trading",
    description:
      "Execute trades instantly with real-time market data and price updates.",
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    description:
      "Track your portfolio performance with detailed charts and metrics.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Two-factor authentication and encrypted data storage for maximum security.",
  },
  {
    icon: Clock,
    title: "Limit Orders",
    description: "Set buy and sell orders at your desired price points.",
  },
  {
    icon: Award,
    title: "Achievements",
    description: "Earn badges and rewards as you reach trading milestones.",
  },
  {
    icon: BarChart3,
    title: "Leaderboard",
    description: "Compete with other traders and climb the rankings.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Powerful Features for Modern Traders
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to succeed in today&apos;s fast-paced market
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="rounded-lg border bg-card p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
