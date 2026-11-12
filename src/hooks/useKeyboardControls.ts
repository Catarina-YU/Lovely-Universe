"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { MoveInput } from "@/core/movement/movement.types";
import type { Direction } from "@/types/types";

const KEY_TO_DIRECTION: Readonly<Record<string, Direction>> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyA: "left",
  ArrowLeft: "left",
  KeyS: "down",
  ArrowDown: "down",
  KeyD: "right",
  ArrowRight: "right",
};

interface KeyboardControlsOptions {
  /** Estado de direcoes compartilhado com o movimento e com os controles de toque. */
  inputRef: RefObject<MoveInput>;
  /** So escuta o teclado enquanto true (apenas na fase de encontro). */
  enabled: boolean;
  /** Tecla E. */
  onInteract?: () => void;
}

/** WASD / setas escrevem em `inputRef`; E dispara `onInteract`. Limpa tudo ao desmontar. */
export function useKeyboardControls({ inputRef, enabled, onInteract }: KeyboardControlsOptions): void {
  const interactRef = useRef(onInteract);
  useEffect(() => {
    interactRef.current = onInteract;
  });

  useEffect(() => {
    if (!enabled) return;
    const input = inputRef.current;

    const release = () => {
      input.up = false;
      input.down = false;
      input.left = false;
      input.right = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.code];
      if (direction) {
        input[direction] = true;
        event.preventDefault();
      } else if (event.code === "KeyE" && !event.repeat) {
        interactRef.current?.();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.code];
      if (direction) input[direction] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
      release();
    };
  }, [inputRef, enabled]);
}
