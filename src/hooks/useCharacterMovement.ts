"use client";

import type { Ticker } from "pixi.js";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { createEmptyInput, resolveMovement } from "@/core/movement/movement";
import type { MoveInput } from "@/core/movement/movement.types";
import { usePixiTick } from "./usePixiTick";
import type { CharacterHandle, Direction, Interactable, Rect, Vec2 } from "@/types/types";

const NO_INPUT = createEmptyInput();

interface CharacterMovementOptions {
  handleRef: RefObject<CharacterHandle | null>;
  inputRef: RefObject<MoveInput>;
  initial: Vec2;
  /** Ref que guarda a posicao atual dos pes (deve comecar em `initial`). */
  positionRef: RefObject<Vec2>;
  bounds: Rect;
  blockers: readonly Rect[];
  /** Alvos de interacao; o mais proximo dentro do alcance e reportado em `onNearChange`. */
  interactables: readonly Interactable[];
  speed?: number;
  enabled?: boolean;
  /** Parado (ex.: durante um balao de fala): ignora as teclas e fica em idle. */
  frozen?: boolean;
  /** Chamado so quando o alvo proximo muda (id do alvo, ou null se nao ha nenhum perto). */
  onNearChange: (id: string | null) => void;
  /** Chamado uma unica vez, no primeiro passo. */
  onFirstMove?: () => void;
  /** Chamado a cada quadro com a posicao atual (ex.: camera). Nao causa re-render. */
  onUpdate?: (position: Vec2) => void;
}

/**
 * Move um personagem controlado pelo jogador. Roda no ticker do Pixi e escreve
 * direto no sprite; o React so e avisado de eventos discretos.
 */
export function useCharacterMovement(options: CharacterMovementOptions): void {
  const { handleRef, inputRef, bounds, blockers, interactables, speed = 72, enabled = true, frozen = false } = options;

  const { positionRef } = options;
  const facing = useRef<Direction>("down");
  const nearId = useRef<string | null>(null);
  const hasMoved = useRef(false);

  const callbacks = useRef({
    onNearChange: options.onNearChange,
    onFirstMove: options.onFirstMove,
    onUpdate: options.onUpdate,
  });
  useEffect(() => {
    callbacks.current = {
      onNearChange: options.onNearChange,
      onFirstMove: options.onFirstMove,
      onUpdate: options.onUpdate,
    };
  });

  const tick = useCallback(
    (ticker: Ticker) => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.05);
      const result = resolveMovement(positionRef.current, frozen ? NO_INPUT : inputRef.current, dt, speed, bounds, blockers, facing.current);
      positionRef.current = { x: result.x, y: result.y };
      facing.current = result.facing;

      const handle = handleRef.current;
      handle?.setPosition(result.x, result.y);
      handle?.play(result.moving ? `walk-${result.facing}` : `idle-${result.facing}`);

      if (result.moving && !hasMoved.current) {
        hasMoved.current = true;
        callbacks.current.onFirstMove?.();
      }

      let nearest: string | null = null;
      let nearestDistance = Infinity;
      for (const item of interactables) {
        const d = Math.hypot(result.x - item.position.x, result.y - item.position.y);
        if (d <= item.distance && d < nearestDistance) {
          nearest = item.id;
          nearestDistance = d;
        }
      }
      if (nearest !== nearId.current) {
        nearId.current = nearest;
        callbacks.current.onNearChange(nearest);
      }

      // So reposiciona a camera quando ha movimento (mexer no mundo todo a cada quadro e caro).
      if (result.moving) callbacks.current.onUpdate?.(positionRef.current);
    },
    [handleRef, inputRef, positionRef, speed, bounds, blockers, interactables, frozen],
  );
  usePixiTick(tick, enabled);

  // Posiciona a camera antes do primeiro quadro e quando o palco muda de tamanho.
  const { onUpdate } = options;
  useEffect(() => {
    onUpdate?.(positionRef.current);
  }, [onUpdate, positionRef]);
}
