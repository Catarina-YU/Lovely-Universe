"use client";

import { extend } from "@pixi/react";
import { Container, Graphics, type Ticker } from "pixi.js";
import { useCallback, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { usePixiTick } from "@/hooks/usePixiTick";
import { fillPixels } from "@/lib/pixelDraw";
import { useStage } from "../PixiStage";

extend({ Container, Graphics });

export interface ShootingStarHandle {
  /** Cruza o ceu uma vez; chama `onDone` ao terminar. */
  launch: (onDone: () => void) => void;
}

interface ShootingStarProps {
  ref?: Ref<ShootingStarHandle>;
}

const DURATION_SECONDS = 1.5;
const TAIL_LENGTH = 16;

/** Estrela cadente em pixel art, do canto superior direito para o centro do ceu. */
export function ShootingStar({ ref }: ShootingStarProps) {
  const { width, height } = useStage();
  const containerRef = useRef<Container | null>(null);
  const flight = useRef<{ t: number; onDone: () => void } | null>(null);

  const path = useMemo(() => {
    const from = { x: width * 0.92, y: height * 0.06 };
    const to = { x: width * 0.3, y: height * 0.36 };
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    return { from, to, ux: (to.x - from.x) / length, uy: (to.y - from.y) / length };
  }, [width, height]);

  useImperativeHandle(
    ref,
    () => ({
      launch(onDone) {
        flight.current = { t: 0, onDone };
        if (containerRef.current) containerRef.current.visible = true;
      },
    }),
    [],
  );

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      // cauda: pixels atras da cabeca, cada vez mais fracos
      for (let i = 1; i <= TAIL_LENGTH; i++) {
        const alpha = 0.9 * (1 - i / (TAIL_LENGTH + 1));
        fillPixels(g, [[Math.round(-path.ux * i), Math.round(-path.uy * i)]], 0xc9d0ff, alpha);
      }
      fillPixels(g, [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]], 0xffffff);
      fillPixels(g, [[1, 1], [-1, -1], [1, -1], [-1, 1]], 0xf5d98b, 0.7);
    },
    [path],
  );

  const tick = useCallback(
    (ticker: Ticker) => {
      const state = flight.current;
      const container = containerRef.current;
      if (!state || !container) return;
      state.t += ticker.deltaMS / 1000 / DURATION_SECONDS;
      const t = Math.min(state.t, 1);
      container.position.set(
        Math.round(path.from.x + (path.to.x - path.from.x) * t),
        Math.round(path.from.y + (path.to.y - path.from.y) * t),
      );
      container.alpha = t < 0.12 ? t / 0.12 : t > 0.8 ? (1 - t) / 0.2 : 1;
      if (state.t >= 1) {
        flight.current = null;
        container.visible = false;
        state.onDone();
      }
    },
    [path],
  );
  usePixiTick(tick);

  return (
    <pixiContainer ref={containerRef} visible={false}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
