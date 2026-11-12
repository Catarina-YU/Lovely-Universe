"use client";

import { extend } from "@pixi/react";
import { Container, Graphics, Sprite, type Ticker } from "pixi.js";
import { useCallback, useImperativeHandle, useRef, type Ref } from "react";
import { SPRITE_MANIFEST } from "@/data/characters";
import { usePixiTick } from "@/hooks/usePixiTick";
import { fillPixelEllipse } from "@/lib/pixelDraw";
import type { AnimationName, CharacterHandle, CharacterId } from "@/types/types";
import { useCharacterFrames } from "./useCharacterFrames";

extend({ Container, Graphics, Sprite });

interface CharacterProps {
  id: CharacterId;
  /** Posicao inicial dos pes. Depois disso, mova pelo `ref`. */
  x: number;
  y: number;
  initialAnimation?: AnimationName;
  /** O handle so existe (nao-nulo) depois que o spritesheet carregou. */
  ref?: Ref<CharacterHandle | null>;
}

/**
 * Personagem animado a partir do spritesheet. A animacao e a posicao sao
 * atualizadas direto no Pixi (via `ref`), sem re-renderizar o React.
 */
export function Character({ id, x, y, initialAnimation = "idle-down", ref }: CharacterProps) {
  const frames = useCharacterFrames(id);
  const containerRef = useRef<Container | null>(null);
  const spriteRef = useRef<Sprite | null>(null);
  const animation = useRef({ name: initialAnimation, time: 0, frame: 0 });

  useImperativeHandle<CharacterHandle | null, CharacterHandle | null>(
    ref,
    () =>
      frames
        ? {
            setPosition(px, py) {
              const container = containerRef.current;
              if (!container) return;
              container.position.set(Math.round(px), Math.round(py));
              container.zIndex = py;
            },
            play(name) {
              if (animation.current.name !== name) {
                animation.current = { name, time: 0, frame: -1 };
              }
            },
          }
        : null,
    [frames],
  );

  const tick = useCallback(
    (ticker: Ticker) => {
      const sprite = spriteRef.current;
      if (!frames || !sprite) return;
      const state = animation.current;
      state.time += ticker.deltaMS / 1000;
      const { fps, frames: count } = SPRITE_MANIFEST.animations[state.name];
      const frame = Math.floor(state.time * fps) % count;
      if (frame !== state.frame) {
        state.frame = frame;
        sprite.texture = frames[state.name][frame];
      }
    },
    [frames],
  );
  usePixiTick(tick);

  const drawShadow = useCallback((g: Graphics) => {
    g.clear();
    fillPixelEllipse(g, 0, -1, 9, 2, 0x050818, 0.35);
  }, []);

  if (!frames) return null;

  return (
    <pixiContainer ref={containerRef} x={x} y={y} zIndex={y}>
      <pixiGraphics draw={drawShadow} />
      <pixiSprite ref={spriteRef} texture={frames[initialAnimation][0]} anchor={{ x: 0.5, y: 1 }} y={1} />
    </pixiContainer>
  );
}
