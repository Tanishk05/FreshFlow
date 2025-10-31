"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { PROBLEM_STATS } from "@/lib/constants";

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="problem"
      ref={ref}
      className="py-24 md:py-32 px-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm relative z-10"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <span className="text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">
              The Core Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mt-4">
              The 40% Problem.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-6">
              A staggering amount of fresh food is lost before it ever reaches a
              plate. This broken system means lost revenue, higher prices, and
              significant environmental strain.
            </p>
          </motion.div>

          <div className="space-y-8">
            {PROBLEM_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {stat.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
