"use client";

import { extend } from "@pixi/react";
import { Container, Graphics, type Ticker } from "pixi.js";
import { useCallback, useMemo, useRef } from "react";
import { HEART_PATH } from "@/data/stars";
import { usePixiTick } from "@/hooks/usePixiTick";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fillPixels, linePixels } from "@/lib/pixelDraw";
import type { Vec2 } from "@/types/types";

extend({ Container, Graphics });

interface HeartConstellationProps {
  /** Posicao de cada estrela (por id). */
  positions: Readonly<Record<string, Vec2>>;
}

const START_DELAY_SECONDS = 0.8;
const DRAW_SECONDS = 4.5;
const CORE_COLOR = 0xfff0b8;
const GLOW_COLOR = 0xb79ae6;

/** O desenho e feito sob demanda em `redraw` (a linha cresce aos poucos). */
function noopDraw(): void {}

/** Linhas luminosas que ligam as estrelas, uma a uma, formando o coracao. */
export function HeartConstellation({ positions }: HeartConstellationProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<Container | null>(null);
  const graphicsRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const drawn = useRef(-1);

  // Todos os pixels da linha, em ordem ao longo do caminho.
  const line = useMemo(() => {
    const line: Array<[number, number]> = [];
    for (let i = 0; i < HEART_PATH.length - 1; i++) {
      const a = positions[HEART_PATH[i]];
      const b = positions[HEART_PATH[i + 1]];
      if (a && b) line.push(...linePixels(a.x, a.y, b.x, b.y));
    }
    return line;
  }, [positions]);

  const redraw = useCallback(
    (count: number) => {
      const g = graphicsRef.current;
      if (!g) return;
      g.clear();
      const visible = line.slice(0, count);
      const seen = new Set(visible.map(([x, y]) => `${x},${y}`));
      const halo: Array<[number, number]> = [];
      for (const [x, y] of visible) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const key = `${x + dx},${y + dy}`;
          if (!seen.has(key)) {
            seen.add(key);
            halo.push([x + dx, y + dy]);
          }
        }
      }
      fillPixels(g, halo, GLOW_COLOR, 0.35);
      fillPixels(g, visible, CORE_COLOR, 0.95);
    },
    [line],
  );

  const tick = useCallback(
    (ticker: Ticker) => {
      elapsed.current += ticker.deltaMS / 1000;
      const progress = reduced ? 1 : Math.min(Math.max((elapsed.current - START_DELAY_SECONDS) / DRAW_SECONDS, 0), 1);
      const count = Math.floor(progress * line.length);
      if (count !== drawn.current) {
        drawn.current = count;
        redraw(count);
      }
      const container = containerRef.current;
      if (container && progress >= 1 && !reduced) {
        container.alpha = 0.85 + 0.15 * Math.sin(elapsed.current * 2.2);
      }
    },
    [reduced, line, redraw],
  );
  usePixiTick(tick);

  return (
    <pixiContainer ref={containerRef}>
      <pixiGraphics ref={graphicsRef} draw={noopDraw} />
    </pixiContainer>
  );
}
