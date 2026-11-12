"use client";

import { useApplication } from "@pixi/react";
import type { Ticker } from "pixi.js";
import { useEffect } from "react";

/**
 * Registra um callback no ticker do Pixi (uma chamada por quadro).
 * Substitui o `useTick` do @pixi/react: ao trocar de cena o Application e destruido
 * antes dos efeitos dos filhos, e o `ticker.remove` deles lanca erro. Aqui a
 * limpeza e tolerante a isso. O `callback` deve ter identidade estavel (useCallback).
 */
export function usePixiTick(callback: (ticker: Ticker) => void, enabled = true): void {
  const { app, isInitialised } = useApplication();

  useEffect(() => {
    if (!isInitialised || !enabled) return;
    const ticker = app?.ticker;
    if (!ticker) return; // Application ja destruido (ex.: remontagem do StrictMode)
    ticker.add(callback);
    return () => {
      try {
        ticker.remove(callback);
      } catch {
        /* ticker ja destruido junto com o Application */
      }
    };
  }, [app, isInitialised, enabled, callback]);
}
