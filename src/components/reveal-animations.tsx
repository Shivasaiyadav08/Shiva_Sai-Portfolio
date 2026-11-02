"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function BlurIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ filter: "blur(10px)", opacity: 0 }}
      animate={{ filter: "blur(0px)", opacity: 1 }}
      transition={{ duration: 1, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BoxReveal({
  children,
  width = "fit-content",
}: {
  children: ReactNode;
  width?: "fit-content" | "100%";
}) {
  return (
    <motion.div
      style={{ width, overflow: "hidden" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
