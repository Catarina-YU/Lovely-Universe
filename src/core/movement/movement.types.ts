import type { Direction } from "@/types/types";

/** Direcoes pressionadas (teclado ou toque). Mutavel de proposito: vive em um ref. */
export type MoveInput = Record<Direction, boolean>;

export interface MovementResult {
  x: number;
  y: number;
  facing: Direction;
  moving: boolean;
}
