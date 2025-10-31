"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type HeroSectionProps = {
  onScrollToSection: (id: string) => void;
};

export default function HeroSection({ onScrollToSection }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center relative px-4 pt-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, staggerChildren: 0.2 },
          },
        }}
      >
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: { opacity: 1, y: 0, transition: { duration: 1.2 } },
          }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300"
        >
          ZERO WASTE.
        </motion.h1>
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 1.2, delay: 0.2 },
            },
          }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mt-2 text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300"
        >
          MAXIMUM FRESHNESS.
        </motion.h1>
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 1.2, delay: 0.4 },
            },
          }}
          className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-8"
        >
          Revolutionizing the fresh food supply chain with predictive AI. From
          farm to fork, we optimize every step to eliminate waste and boost your
          profits.
        </motion.p>
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 1.2, delay: 0.6 },
            },
          }}
          onClick={() => onScrollToSection("solution")}
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-medium mt-10 text-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Discover How
        </motion.button>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-10"
      >
        <ChevronDown className="w-8 h-8 text-gray-400" />
      </motion.div>
    </section>
  );
}
