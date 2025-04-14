"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Trade Smarter, <span className="text-primary">Not Harder</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Experience the future of stock trading with real-time updates,
              advanced analytics, and a gamified experience that makes investing
              fun and rewarding.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <motion.div
        className="absolute bottom-0 left-0 right-0 -z-10 h-[300px] bg-gradient-to-t from-background to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </section>
  );
}
