import type { GamePhase } from "@/types/types";

export interface GameState {
  phase: GamePhase;
  /** Quantas memorias ja foram descobertas; tambem e o indice da estrela disponivel. */
  memoryIndex: number;
  /** Ja chegou a fase de memorias alguma vez (usado para retomar o progresso salvo). */
  reachedMemories: boolean;
  /** O progresso salvo ja foi lido do navegador. */
  hydrated: boolean;
}

/** Parte do estado que e salva no navegador. */
export interface SavedProgress {
  memoryIndex: number;
  reachedMemories: boolean;
}

export type GameAction =
  | { type: "HYDRATE"; saved: SavedProgress | null }
  | { type: "START" }
  | { type: "ENCOUNTER" }
  | { type: "SEATED" }
  | { type: "DIALOGUE_DONE" }
  | { type: "DISCOVER_MEMORY" }
  | { type: "REPLAY" }
  | { type: "RESET" };
