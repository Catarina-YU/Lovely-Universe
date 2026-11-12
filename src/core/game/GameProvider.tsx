"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { clearProgress, loadProgress, saveProgress } from "@/lib/storage";
import type { GameAction, GameState } from "./game.types";
import { gameReducer, initialGameState } from "./gameReducer";

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Le o progresso salvo apenas no cliente (evita divergencia de hidratacao).
  useEffect(() => {
    dispatch({ type: "HYDRATE", saved: loadProgress() });
  }, []);

  // Salva a cada mudanca de progresso, depois da leitura inicial.
  const { hydrated, memoryIndex, reachedMemories } = state;
  useEffect(() => {
    if (!hydrated) return;
    if (!reachedMemories && memoryIndex === 0) clearProgress();
    else saveProgress({ memoryIndex, reachedMemories });
  }, [hydrated, memoryIndex, reachedMemories]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame precisa estar dentro de <GameProvider>");
  return ctx;
}
