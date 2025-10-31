"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { VALUE_PROPS } from "@/lib/constants";

export default function ValueSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="value"
      ref={ref}
      className="py-24 md:py-32 px-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm relative z-10"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">
            Value Proposition
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mt-4">
            A Smarter Chain for Everyone.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {VALUE_PROPS.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 md:p-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold mt-4">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
