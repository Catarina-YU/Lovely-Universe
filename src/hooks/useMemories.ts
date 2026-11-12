"use client";

import { useMemo } from "react";
import { useGame } from "@/core/game/GameProvider";
import { MEMORIES } from "@/data/memories";
import type { Memory, StarState } from "@/types/types";

export interface MemoriesView {
  /** Memorias ordenadas pela ordem narrativa. */
  memories: readonly Memory[];
  total: number;
  discoveredCount: number;
  /** Memoria da estrela atualmente disponivel (null quando todas foram descobertas). */
  current: Memory | null;
  isComplete: boolean;
  getStarState: (starId: string) => StarState;
  getMemoryByStar: (starId: string) => Memory | undefined;
}

const ORDERED: readonly Memory[] = [...MEMORIES].sort((a, b) => a.order - b.order);

/** Unica fonte de verdade do progresso: derivado de `memoryIndex` no estado global. */
export function useMemories(): MemoriesView {
  const {
    state: { memoryIndex },
  } = useGame();

  return useMemo<MemoriesView>(() => {
    const total = ORDERED.length;
    const getStarState = (starId: string): StarState => {
      const i = ORDERED.findIndex((m) => m.starId === starId);
      if (i < 0 || i > memoryIndex) return "locked";
      return i === memoryIndex ? "available" : "discovered";
    };
    return {
      memories: ORDERED,
      total,
      discoveredCount: memoryIndex,
      current: ORDERED[memoryIndex] ?? null,
      isComplete: memoryIndex >= total,
      getStarState,
      getMemoryByStar: (starId) => ORDERED.find((m) => m.starId === starId),
    };
  }, [memoryIndex]);
}
