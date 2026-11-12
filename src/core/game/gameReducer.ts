import { MEMORIES } from "@/data/memories";
import type { GameAction, GameState } from "./game.types";

export const TOTAL_MEMORIES = MEMORIES.length;

export const initialGameState: GameState = {
  phase: "intro",
  memoryIndex: 0,
  reachedMemories: false,
  hydrated: false,
};

/**
 * Maquina de estados do jogo. Transicoes invalidas para a fase atual sao ignoradas,
 * entao nenhuma interface consegue "pular" etapas por engano.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE": {
      const saved = action.saved;
      if (!saved || !saved.reachedMemories) return { ...state, hydrated: true };
      const memoryIndex = Math.min(Math.max(saved.memoryIndex, 0), TOTAL_MEMORIES);
      return {
        phase: memoryIndex >= TOTAL_MEMORIES ? "finale" : "memories",
        memoryIndex,
        reachedMemories: true,
        hydrated: true,
      };
    }
    case "START":
      return state.phase === "intro" ? { ...state, phase: "meeting" } : state;
    case "ENCOUNTER":
      return state.phase === "meeting" ? { ...state, phase: "sitting" } : state;
    case "SEATED":
      return state.phase === "sitting" ? { ...state, phase: "dialogue" } : state;
    case "DIALOGUE_DONE":
      return state.phase === "dialogue"
        ? { ...state, phase: "memories", reachedMemories: true }
        : state;
    case "DISCOVER_MEMORY": {
      if (state.phase !== "memories") return state;
      const memoryIndex = state.memoryIndex + 1;
      return {
        ...state,
        memoryIndex,
        phase: memoryIndex >= TOTAL_MEMORIES ? "finale" : "memories",
      };
    }
    case "REPLAY":
      return state.phase === "finale" ? { ...state, phase: "memories", memoryIndex: 0 } : state;
    case "RESET":
      return { ...initialGameState, hydrated: true };
  }
}
