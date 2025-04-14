"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingCTA() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          className="rounded-2xl bg-primary-foreground p-8 md:p-12 lg:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Start Trading?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of traders who are already using StockTrader Pro to
              achieve their financial goals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
