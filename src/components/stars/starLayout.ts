import { STARS } from "@/data/stars";
import type { Vec2 } from "@/types/types";

const TOP_MARGIN = 26;

/**
 * Posicao em pixels de cada estrela no palco. O coracao ocupa um quadrado que cabe
 * entre o topo e as colinas, sem deformar em telas largas.
 */
export function computeStarPositions(width: number, height: number): Record<string, Vec2> {
  const box = Math.max(50, Math.min(width * 0.85, height - 123));
  const left = (width - box) / 2;
  return Object.fromEntries(
    STARS.map((star) => [
      star.id,
      { x: Math.round(left + star.x * box), y: Math.round(TOP_MARGIN + star.y * box) },
    ]),
  );
}
