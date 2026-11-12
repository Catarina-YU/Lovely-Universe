import type { SavedProgress } from "@/core/game/game.types";
import { STORAGE_KEY } from "./constants";

/** Leitura/escrita defensiva: o armazenamento pode estar bloqueado ou corrompido. */
export function loadProgress(): SavedProgress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (
      typeof data === "object" &&
      data !== null &&
      "memoryIndex" in data &&
      "reachedMemories" in data &&
      typeof data.memoryIndex === "number" &&
      typeof data.reachedMemories === "boolean"
    ) {
      return { memoryIndex: data.memoryIndex, reachedMemories: data.reachedMemories };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* sem armazenamento: o jogo segue funcionando sem salvar */
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignorado */
  }
}
