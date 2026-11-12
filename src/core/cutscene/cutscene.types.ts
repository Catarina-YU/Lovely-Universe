import type { RefObject } from "react";
import type { CharacterHandle, Vec2 } from "@/types/types";

/** Personagem controlado por uma cutscene. `position` e atualizado a cada quadro. */
export interface CutsceneActor {
  position: Vec2;
  handle: RefObject<CharacterHandle | null>;
}

/** Roda um passo por quadro; retorna true quando terminou. */
export type StepRunner = (deltaSeconds: number) => boolean;

/** Fabrica de passo: o estado interno nasce quando o passo comeca. */
export type Step = () => StepRunner;
