"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { usePreloader } from "../preloader/context";

export function IntroReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { isLoading } = usePreloader();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: isLoading ? 0 : 1,
        y: isLoading && !reduceMotion ? 24 : 0,
      }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.85,
        delay: isLoading || reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
      inert={isLoading}
      data-intro-reveal={isLoading ? "waiting" : "ready"}
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
        style={{ willChange: "transform, opacity" }}
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
