"use client";

import { extend } from "@pixi/react";
import { Container, Graphics, type Ticker } from "pixi.js";
import { useCallback, useMemo, useRef } from "react";
import { usePixiTick } from "@/hooks/usePixiTick";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fillPixels } from "@/lib/pixelDraw";
import { createSeededRandom } from "@/lib/utils";
import { useStage } from "../PixiStage";

extend({ Container, Graphics });

const SKY_BANDS = [0x0b1033, 0x101644, 0x161c52, 0x1f2260, 0x2a2a74, 0x3b3590] as const;
const STAR_COLORS = [0xc9d0ff, 0xc9d0ff, 0xffffff, 0xf5d98b] as const;
const TWINKLE_GROUPS = 3;

interface SkyStar {
  x: number;
  y: number;
  big: boolean;
  color: number;
}

interface NightSkyProps {
  /** Semente: mesmo valor = mesmo ceu. */
  seed?: number;
  /** Fracao inferior da tela sem estrelas (onde ficam as colinas). */
  groundRatio?: number;
}

/** Ceu noturno em degraus com estrelas que cintilam em tres ondas. */
export function NightSky({ seed = 7, groundRatio = 0.15 }: NightSkyProps) {
  const { width, height } = useStage();
  const reduced = useReducedMotion();
  const groupRefs = useRef<Array<Container | null>>([]);
  const elapsed = useRef(0);

  const groups = useMemo<SkyStar[][]>(() => {
    const rnd = createSeededRandom(seed);
    const count = Math.round((width * height) / 480);
    const list: SkyStar[][] = Array.from({ length: TWINKLE_GROUPS }, () => []);
    for (let i = 0; i < count; i++) {
      list[i % TWINKLE_GROUPS].push({
        x: 2 + Math.floor(rnd() * (width - 4)),
        y: 2 + Math.floor(rnd() * (height * (1 - groundRatio) - 4)),
        big: rnd() < 0.14,
        color: STAR_COLORS[Math.floor(rnd() * STAR_COLORS.length)],
      });
    }
    return list;
  }, [width, height, seed, groundRatio]);

  const drawSky = useCallback(
    (g: Graphics) => {
      g.clear();
      const bandHeight = Math.ceil(height / SKY_BANDS.length);
      SKY_BANDS.forEach((color, i) => {
        g.rect(0, i * bandHeight, width, bandHeight).fill(color);
      });
    },
    [width, height],
  );

  const tick = useCallback((ticker: Ticker) => {
    elapsed.current += ticker.deltaMS / 1000;
    groupRefs.current.forEach((container, i) => {
      if (container) {
        container.alpha = 0.6 + 0.4 * Math.sin(elapsed.current * (1.3 + i * 0.5) + i * 2.1);
      }
    });
  }, []);
  usePixiTick(tick, !reduced);

  return (
    <pixiContainer>
      <pixiGraphics draw={drawSky} />
      {groups.map((stars, i) => (
        <pixiContainer
          key={i}
          ref={(node: Container | null) => {
            groupRefs.current[i] = node;
          }}
        >
          <pixiGraphics
            draw={(g: Graphics) => {
              g.clear();
              const colors = new Set(stars.map((s) => s.color));
              for (const color of colors) {
                const pixels: Array<[number, number]> = [];
                for (const s of stars) {
                  if (s.color !== color) continue;
                  pixels.push([s.x, s.y]);
                  if (s.big) pixels.push([s.x - 1, s.y], [s.x + 1, s.y], [s.x, s.y - 1], [s.x, s.y + 1]);
                }
                fillPixels(g, pixels, color);
              }
            }}
          />
        </pixiContainer>
      ))}
    </pixiContainer>
  );
}
