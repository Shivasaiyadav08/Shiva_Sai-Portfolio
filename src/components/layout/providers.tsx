"use client";
import { MotionConfig } from "framer-motion";
import Preloader from "../preloader";
import { ThemeProvider } from "next-themes";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <Preloader>{children}</Preloader>
      </MotionConfig>
    </ThemeProvider>
  );
};
