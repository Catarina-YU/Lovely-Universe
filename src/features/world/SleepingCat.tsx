"use client";

import { extend } from "@pixi/react";
import { Graphics, type Ticker } from "pixi.js";
import { useCallback, useRef } from "react";
import { drawCat } from "@/features/meeting/worldArt";
import { usePixiTick } from "@/hooks/usePixiTick";
import { useReducedMotion } from "@/hooks/useReducedMotion";

extend({ Graphics });

interface SleepingCatProps {
  x: number;
  y: number;
}

const BREATH_SECONDS = 1.4;

/** A gata deitada: respira devagar (as costas sobem e descem 1 pixel). */
export function SleepingCat({ x, y }: SleepingCatProps) {
  const reduced = useReducedMotion();
  const graphicsRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const breathing = useRef(false);

  const draw = useCallback((g: Graphics) => drawCat(g, false), []);

  const tick = useCallback((ticker: Ticker) => {
    const g = graphicsRef.current;
    if (!g) return;
    elapsed.current += ticker.deltaMS / 1000;
    const breathe = Math.floor(elapsed.current / BREATH_SECONDS) % 2 === 1;
    if (breathe !== breathing.current) {
      breathing.current = breathe;
      drawCat(g, breathe);
    }
  }, []);
  usePixiTick(tick, !reduced);

  return <pixiGraphics ref={graphicsRef} x={x} y={y} zIndex={y} draw={draw} />;
}
