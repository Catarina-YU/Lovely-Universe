"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGame } from "./GameProvider";
import type { GameAction } from "./game.types";

interface SceneTransition {
  /** Cortina preta ativa (durante a troca de cena). */
  covered: boolean;
  durationMs: number;
  /** Escurece a tela, aplica a acao e clareia de novo. */
  transitionTo: (action: GameAction) => void;
}

/** Transicao suave entre fases: fade para preto -> dispatch -> fade de volta. */
export function useSceneTransition(): SceneTransition {
  const { dispatch } = useGame();
  const reduced = useReducedMotion();
  const durationMs = reduced ? 120 : 700;
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const transitionTo = useCallback(
    (action: GameAction) => {
      if (timer.current !== null) return;
      setBusy(true);
      timer.current = window.setTimeout(() => {
        dispatch(action);
        timer.current = window.setTimeout(() => {
          timer.current = null;
          setBusy(false);
        }, 60);
      }, durationMs);
    },
    [dispatch, durationMs],
  );

  return { covered: busy, durationMs, transitionTo };
}
