"use client";

import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { fillPixels } from "@/lib/pixelDraw";

extend({ Graphics });

const GLOW_RINGS = 4;
const CRATERS: ReadonlyArray<readonly [number, number, number]> = [
  [-4, -4, 3],
  [4, 2, 2.5],
  [-3, 6, 2],
  [6, -6, 1.5],
];

interface MoonProps {
  x: number;
  y: number;
  radius?: number;
}

/** Lua em pixel art com halo luminoso. (x, y) e o centro. */
export function Moon({ x, y, radius = 13 }: MoonProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      const reach = radius + GLOW_RINGS * 3;
      const glow: Array<Array<[number, number]>> = Array.from({ length: GLOW_RINGS }, () => []);
      const body: Array<[number, number]> = [];
      const shade: Array<[number, number]> = [];
      const crater: Array<[number, number]> = [];

      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          const d = Math.hypot(dx + 0.5, dy + 0.5);
          if (d <= radius) {
            const inCrater = CRATERS.some(([cx, cy, r]) => Math.hypot(dx - cx, dy - cy) <= r);
            if (inCrater) crater.push([x + dx, y + dy]);
            else if (dx + dy * 0.4 > radius * 0.5) shade.push([x + dx, y + dy]);
            else body.push([x + dx, y + dy]);
          } else if (d <= reach) {
            const ring = Math.min(GLOW_RINGS - 1, Math.floor((d - radius) / 3));
            glow[ring].push([x + dx, y + dy]);
          }
        }
      }
      glow.forEach((pixels, i) => fillPixels(g, pixels, 0x8f86e0, 0.2 - i * 0.045));
      fillPixels(g, body, 0xf6efe0);
      fillPixels(g, shade, 0xdcd3c4);
      fillPixels(g, crater, 0xcfc6b8);
    },
    [x, y, radius],
  );

  return <pixiGraphics draw={draw} />;
}
