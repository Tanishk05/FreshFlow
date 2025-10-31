"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="contact"
      ref={ref}
      className="py-24 md:py-40 px-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-gray-900 dark:text-white relative z-10"
    >
      <div className="container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tighter"
          >
            Stop the Waste.
            <br />
            Start the{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-green-300">
              Revolution.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-xl mx-auto mt-6"
          >
            See a live demo of how our platform can integrate with your
            operations and start saving you money from day one.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-green-500 text-gray-900 px-8 py-3 text-base md:px-10 md:py-4 md:text-lg rounded-full font-bold mt-10"
          >
            Request a Free Demo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
