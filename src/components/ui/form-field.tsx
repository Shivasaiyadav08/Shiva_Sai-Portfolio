"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function FieldHighlight({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(${hovered ? 100 : 0}px circle at ${x}px ${y}px, var(--brand), transparent 80%)`;

  return (
    <motion.div
      className="rounded-lg p-0.5"
      style={{ background }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - bounds.left);
        y.set(event.clientY - bounds.top);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <FieldHighlight>
      <input className={cn(fieldClassName, "h-10", className)} {...props} />
    </FieldHighlight>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <FieldHighlight>
      <textarea
        className={cn(fieldClassName, "min-h-28", className)}
        {...props}
      />
    </FieldHighlight>
  );
}
