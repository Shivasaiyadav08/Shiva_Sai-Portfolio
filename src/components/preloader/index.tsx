"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "./loader";
import { PreloaderContext } from "./context";

export default function Preloader({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  // Optional graphics must never hold the page behind a completed intro.
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const value = useMemo(() => ({ isLoading: showIntro }), [showIntro]);

  return (
    <PreloaderContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {showIntro && (
          <Loader
            key="portfolio-intro"
            onComplete={finishIntro}
            onSkip={finishIntro}
          />
        )}
      </AnimatePresence>
      {children}
    </PreloaderContext.Provider>
  );
}
