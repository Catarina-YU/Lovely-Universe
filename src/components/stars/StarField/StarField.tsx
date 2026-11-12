"use client";

import { extend } from "@pixi/react";
import { Container, type Ticker } from "pixi.js";
import { useCallback, useMemo, useRef } from "react";
import { useStage } from "@/components/pixi/PixiStage";
import { STARS } from "@/data/stars";
import { usePixiTick } from "@/hooks/usePixiTick";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { StarState } from "@/types/types";
import { HeartConstellation } from "../HeartConstellation";
import { Star } from "../Star";
import { computeStarPositions } from "../starLayout";

extend({ Container });

interface StarFieldProps {
  states: Readonly<Record<string, StarState>>;
  /** Estrela em animacao de destaque (null = nenhuma). */
  burstingId: string | null;
  interactive: boolean;
  /** Final: todas as estrelas brilham e a constelacao em coracao aparece. */
  celebrate: boolean;
  onStarTap: (starId: string) => void;
}

const FADE_IN_SECONDS = 1.6;

/** As estrelas interativas, distribuidas no ceu (formam o coracao quando todas brilham). */
export function StarField({ states, burstingId, interactive, celebrate, onStarTap }: StarFieldProps) {
  const { width, height } = useStage();
  const reduced = useReducedMotion();
  const containerRef = useRef<Container | null>(null);
  const fade = useRef(reduced ? 1 : 0);

  const positions = useMemo(() => computeStarPositions(width, height), [width, height]);

  const tick = useCallback((ticker: Ticker) => {
    const container = containerRef.current;
    if (!container || fade.current >= 1) return;
    fade.current = Math.min(1, fade.current + ticker.deltaMS / 1000 / FADE_IN_SECONDS);
    container.alpha = fade.current;
  }, []);
  usePixiTick(tick);

  return (
    <pixiContainer ref={containerRef} alpha={reduced ? 1 : 0}>
      {celebrate && <HeartConstellation positions={positions} />}
      {STARS.map((star) => (
        <Star
          key={star.id}
          x={positions[star.id].x}
          y={positions[star.id].y}
          size={star.size}
          state={states[star.id] ?? "locked"}
          bursting={burstingId === star.id}
          interactive={interactive}
          celebrate={celebrate}
          onTap={() => onStarTap(star.id)}
        />
      ))}
    </pixiContainer>
  );
}
