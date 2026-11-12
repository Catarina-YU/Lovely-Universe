"use client";

import { useCallback, useEffect, useState } from "react";

interface TypewriterState {
  text: string;
  count: number;
}

interface TypewriterResult {
  visibleText: string;
  isDone: boolean;
  /** Mostra o texto inteiro imediatamente. */
  complete: () => void;
}

/** Texto progressivo. Trocar `text` reinicia a digitacao automaticamente. */
export function useTypewriter(text: string, speedMs = 32, instant = false): TypewriterResult {
  const [state, setState] = useState<TypewriterState>({ text, count: 0 });
  const count = instant ? text.length : state.text === text ? state.count : 0;
  const isDone = count >= text.length;

  useEffect(() => {
    if (instant || isDone) return;
    const id = window.setInterval(() => {
      setState((prev) =>
        prev.text === text ? { text, count: prev.count + 1 } : { text, count: 1 },
      );
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, instant, isDone]);

  const complete = useCallback(() => setState({ text, count: text.length }), [text]);

  return { visibleText: text.slice(0, count), isDone, complete };
}
