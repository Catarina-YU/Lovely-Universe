"use client";

import { extend } from "@pixi/react";
import { Circle, Container, Graphics, type Ticker } from "pixi.js";
import { useCallback, useMemo, useRef } from "react";
import { usePixiTick } from "@/hooks/usePixiTick";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fillPixelEllipse, fillPixels } from "@/lib/pixelDraw";
import type { StarState } from "@/types/types";

extend({ Container, Graphics });

interface StarProps {
  x: number;
  y: number;
  /** Escala relativa (1 = padrao). */
  size: number;
  state: StarState;
  /** Animacao de destaque depois do clique (cresce, brilha e solta um anel). */
  bursting: boolean;
  /** Aceita cliques (so durante a fase de memorias). */
  interactive: boolean;
  /** Final: brilho especial dourado e mais forte. */
  celebrate: boolean;
  onTap: () => void;
}

const BURST_SECONDS = 0.6;

const BODY_COLOR: Record<StarState, number> = {
  locked: 0x7a80c0,
  available: 0xf5d98b,
  discovered: 0xb79ae6,
};

function armLength(state: StarState, size: number): number {
  const base = state === "locked" ? 2 : state === "available" ? 4 : 3;
  return Math.max(2, Math.round(base * size));
}

/** Estrela interativa: apagada (bloqueada), brilhante (disponivel) ou lilas (descoberta). */
export function Star({ x, y, size, state, bursting, interactive, celebrate, onTap }: StarProps) {
  const reduced = useReducedMotion();
  const arm = armLength(state, size) + (celebrate ? 1 : 0);
  const containerRef = useRef<Container | null>(null);
  const haloRef = useRef<Graphics | null>(null);
  const ringRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const burst = useRef<number | null>(null);
  const phase = useMemo(() => (x * 7 + y * 3) % 6, [x, y]);

  const drawBody = useCallback(
    (g: Graphics) => {
      g.clear();
      const pixels: Array<[number, number]> = [];
      for (let i = -arm; i <= arm; i++) pixels.push([i, 0], [0, i]);
      pixels.push([-1, -1], [1, -1], [-1, 1], [1, 1]);
      if (state !== "locked") {
        const d = Math.max(2, Math.round(arm / 2));
        pixels.push([-d, -d], [d, -d], [-d, d], [d, d]);
      }
      fillPixels(g, pixels, celebrate ? 0xfff0b8 : BODY_COLOR[state]);
      if (state !== "locked") fillPixels(g, [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]], 0xffffff);
    },
    [arm, state, celebrate],
  );

  const drawHalo = useCallback(
    (g: Graphics) => {
      g.clear();
      if (state === "locked") return;
      const color = state === "available" || celebrate ? 0xfff0b8 : 0xb79ae6;
      for (let i = 3; i >= 0; i--) {
        const r = arm + 3 + i * 3;
        fillPixelEllipse(g, 0, 0, r, r, color, 0.07 + (3 - i) * 0.04);
      }
    },
    [arm, state, celebrate],
  );

  const drawRing = useCallback((g: Graphics) => {
    g.clear();
    const seen = new Set<string>();
    const pixels: Array<[number, number]> = [];
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const px = Math.round(Math.cos(a) * 8);
      const py = Math.round(Math.sin(a) * 8);
      const key = `${px},${py}`;
      if (!seen.has(key)) {
        seen.add(key);
        pixels.push([px, py]);
      }
    }
    fillPixels(g, pixels, 0xffffff);
  }, []);

  const tick = useCallback(
    (ticker: Ticker) => {
      const container = containerRef.current;
      const halo = haloRef.current;
      const ring = ringRef.current;
      if (!container || !halo || !ring) return;
      const dt = ticker.deltaMS / 1000;
      elapsed.current += dt;
      const t = elapsed.current + phase;

      let scale = 1;
      let haloAlpha = 0;
      let bodyAlpha = 1;
      let ringOn = false;

      if (bursting) {
        burst.current = (burst.current ?? 0) + dt;
        const k = Math.min(burst.current / BURST_SECONDS, 1);
        scale = reduced ? 2 : 1 + 1.2 * (1 - (1 - k) ** 2);
        haloAlpha = 1;
        if (!reduced) {
          const r = (burst.current % 0.7) / 0.7;
          ring.scale.set(1 + r * 3);
          ring.alpha = 1 - r;
          ringOn = true;
        }
      } else {
        burst.current = null;
        if (state === "available") {
          scale = reduced ? 1 : 1 + 0.12 * Math.sin(t * 3.2);
          haloAlpha = reduced ? 0.8 : 0.6 + 0.35 * Math.sin(t * 3.2);
        } else if (state === "discovered") {
          scale = celebrate && !reduced ? 1 + 0.15 * Math.sin(t * 2.4) : 1;
          haloAlpha = celebrate ? (reduced ? 0.9 : 0.75 + 0.25 * Math.sin(t * 2.4)) : 0.6;
        } else {
          bodyAlpha = reduced ? 0.6 : 0.5 + 0.15 * Math.sin(t * 1.7);
        }
      }

      if (container.scale.x !== scale) container.scale.set(scale);
      container.alpha = bodyAlpha;
      halo.alpha = haloAlpha;
      ring.visible = ringOn;
    },
    [bursting, state, reduced, phase, celebrate],
  );
  usePixiTick(tick);

  const hitRadius = Math.max(10, arm + 6);
  const hitArea = useMemo(() => new Circle(0, 0, hitRadius), [hitRadius]);

  return (
    <pixiContainer
      ref={containerRef}
      x={x}
      y={y}
      eventMode={interactive ? "static" : "none"}
      cursor={state === "locked" ? "not-allowed" : "pointer"}
      hitArea={hitArea}
      onPointerTap={onTap}
    >
      <pixiGraphics ref={haloRef} draw={drawHalo} />
      <pixiGraphics ref={ringRef} draw={drawRing} visible={false} />
      <pixiGraphics draw={drawBody} />
    </pixiContainer>
  );
}
