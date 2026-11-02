"use client";

import { createContext, useContext } from "react";

type PreloaderState = {
  isLoading: boolean;
  canInitializeScene: boolean;
  registerScene: () => () => void;
};

export const PreloaderContext = createContext<PreloaderState>({
  isLoading: false,
  canInitializeScene: true,
  registerScene: () => () => {},
});
export const usePreloader = () => useContext(PreloaderContext);
