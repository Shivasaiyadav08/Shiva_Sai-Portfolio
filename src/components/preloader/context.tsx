"use client";

import { createContext, useContext } from "react";

type PreloaderState = {
  isLoading: boolean;
};

export const PreloaderContext = createContext<PreloaderState>({
  isLoading: false,
});
export const usePreloader = () => useContext(PreloaderContext);
