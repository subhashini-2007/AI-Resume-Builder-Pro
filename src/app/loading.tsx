"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing circle */}
        <motion.div
          className="absolute h-24 w-24 rounded-full border-2 border-primary/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle rotating gradient ring */}
        <motion.div
          className="h-16 w-16 rounded-full border-2 border-b-primary/40 border-l-transparent border-r-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner core pulse */}
        <motion.div
          className="absolute h-6 w-6 rounded-full bg-primary"
          animate={{
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Loading text with gradient */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-xl font-semibold tracking-wide text-transparent">
          AI Resume Builder Pro
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Initializing resume workspace...</p>
      </motion.div>
    </div>
  );
}
