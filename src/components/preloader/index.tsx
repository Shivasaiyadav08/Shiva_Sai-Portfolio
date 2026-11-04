"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "./loader";
import { PreloaderContext } from "./context";

export default function Preloader({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [pendingScenes, setPendingScenes] = useState(0);
  const finishIntro = useCallback(() => setIntroFinished(true), []);
  const skipIntro = useCallback(() => {
    setIntroFinished(true);
    setShowIntro(false);
  }, []);
  const registerScene = useCallback(() => {
    setPendingScenes((count) => count + 1);
    let settled = false;
    return () => {
      if (settled) return;
      settled = true;
      setPendingScenes((count) => count - 1);
    };
  }, []);

  useEffect(() => {
    if (introFinished && pendingScenes === 0) setShowIntro(false);
    if (!introFinished || pendingScenes === 0) return;
    // A stalled optional WebGL asset must not indefinitely cover the page.
    const timeout = window.setTimeout(() => setShowIntro(false), 8000);
    return () => window.clearTimeout(timeout);
  }, [introFinished, pendingScenes]);

  return (
    <PreloaderContext.Provider
      value={{
        isLoading: showIntro,
        canInitializeScene: introFinished,
        registerScene,
      }}
    >
      <AnimatePresence mode="wait">
        {showIntro && (
          <Loader
            key="portfolio-intro"
            onComplete={finishIntro}
            onSkip={skipIntro}
          />
        )}
      </AnimatePresence>
      {children}
    </PreloaderContext.Provider>
  );
}
