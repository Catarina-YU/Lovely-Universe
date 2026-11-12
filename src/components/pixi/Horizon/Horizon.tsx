"use client";

import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { useStage } from "../PixiStage";

extend({ Graphics });

interface HorizonProps {
  /** Fracao da altura onde as colinas comecam (0..1). */
  top?: number;
}

/** Duas camadas de colinas em silhueta na base da tela. */
export function Horizon({ top = 0.84 }: HorizonProps) {
  const { width, height } = useStage();

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      const layers = [
        { color: 0x1b1f55, base: height * (top - 0.03), amp: 5, freq: 0.035, phase: 1 },
        { color: 0x12153d, base: height * top + 2, amp: 4, freq: 0.05, phase: 3 },
      ];
      for (const { color, base, amp, freq, phase } of layers) {
        for (let x = 0; x < width; x++) {
          const y = Math.round(base + Math.sin(x * freq + phase) * amp);
          g.rect(x, y, 1, height - y);
        }
        g.fill(color);
      }
    },
    [width, height, top],
  );

  return <pixiGraphics draw={draw} />;
}
