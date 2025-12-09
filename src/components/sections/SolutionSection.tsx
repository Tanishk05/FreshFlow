"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SOLUTION_STEPS } from "@/lib/constants";
import Image from "next/image";

export default function SolutionSection() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef(null);

  return (
    <section
      id="solution"
      ref={ref}
      className="py-24 md:py-40 px-4 bg-white dark:bg-gray-950 text-gray-900 dark:text-white relative z-10 overflow-hidden"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">
            The AI-Powered Solution
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mt-4 text-gray-900 dark:text-white">
            From Data to Delivery, Optimized.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <div className="md:order-1 space-y-16 md:space-y-24">
            {SOLUTION_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                onViewportEnter={() => setActiveStep(i)}
                className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
              >
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                  {step.subtitle}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="md:order-2 md:sticky top-24 h-[50vh] sm:h-[60vh] md:h-screen flex items-center">
            <div className="relative w-full h-full max-h-[600px] bg-gray-200 dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={SOLUTION_STEPS[activeStep].image}
                    alt={SOLUTION_STEPS[activeStep].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    priority={false}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

              <motion.h3
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 text-2xl md:text-3xl font-bold z-10 text-white drop-shadow-lg"
              >
                {SOLUTION_STEPS[activeStep].title}
              </motion.h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
