"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PRICING_LISTS } from "@/lib/constants";

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 md:py-32 px-4 bg-green-50/80 dark:bg-green-950/50 backdrop-blur-sm relative z-10 overflow-hidden"
    >
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">
            Business Model
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mt-4">
            A Model That Works For You.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03 }}
            className="p-6 md:p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-2xl md:text-3xl font-bold">SaaS Model</h3>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mt-4">
              A simple, predictable monthly subscription. Get full access to our
              platform&apos;s predictive forecasting, logistics, and retail
              tools.
            </p>
            <ul className="space-y-3 mt-6 text-gray-700 dark:text-gray-300">
              {PRICING_LISTS.saas.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center"
                >
                  <span className="text-green-500 mr-2">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="p-6 md:p-10 bg-green-700 text-white rounded-xl shadow-2xl border-4 border-green-400 relative overflow-hidden"
          >
            <span className="inline-block bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Most Popular
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mt-4">
              Gain-Sharing Model
            </h3>
            <p className="text-base md:text-lg text-green-100 mt-4">
              Our success is tied to yours. We offer our platform for a low base
              fee, plus a small percentage of the money we save you from reduced
              spoilage.
            </p>
            <ul className="space-y-3 mt-6 text-green-50">
              {PRICING_LISTS.gain.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center"
                >
                  <span className="text-green-400 mr-2">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
