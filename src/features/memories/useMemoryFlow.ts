"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/core/game/GameProvider";
import { playSfx } from "@/core/audio/audioEngine";
import { LOCKED_STAR_MESSAGES } from "@/data/dialogues";
import { STARS } from "@/data/stars";
import { useMemories } from "@/hooks/useMemories";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { GamePhase, Memory, StarState } from "@/types/types";

const BURST_MS = 700;
const TOAST_MS = 3200;

interface MemoryFlow {
  starStates: Readonly<Record<string, StarState>>;
  burstingStarId: string | null;
  openMemory: Memory | null;
  /** A memoria aberta ja tinha sido descoberta (o cartao so fecha). */
  isReview: boolean;
  toast: string | null;
  progress: { found: number; total: number };
  onStarTap: (starId: string) => void;
  onContinue: () => void;
}

/**
 * Fluxo da tela 5: clicar numa estrela -> destaque -> cartao da memoria -> CONTINUAR
 * descobre a memoria e libera a proxima estrela. O progresso vem de `useMemories`
 * (uma unica fonte de verdade); aqui ficam so os estados temporarios da interface.
 */
export function useMemoryFlow(phase: GamePhase): MemoryFlow {
  const { dispatch } = useGame();
  const memories = useMemories();
  const reduced = useReducedMotion();

  const [burstingStarId, setBurstingStarId] = useState<string | null>(null);
  const [openStarId, setOpenStarId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<{ burst: number | null; toast: number | null }>({ burst: null, toast: null });

  useEffect(() => {
    const current = timers.current;
    return () => {
      if (current.burst !== null) window.clearTimeout(current.burst);
      if (current.toast !== null) window.clearTimeout(current.toast);
    };
  }, []);

  const starStates = useMemo(
    () => Object.fromEntries(STARS.map((s) => [s.id, memories.getStarState(s.id)])) as Record<string, StarState>,
    [memories],
  );

  const onStarTap = useCallback(
    (starId: string) => {
      if (phase !== "memories" || burstingStarId || openStarId) return;
      const state = memories.getStarState(starId);

      if (state === "locked") {
        playSfx("locked");
        const message = LOCKED_STAR_MESSAGES[Math.floor(Math.random() * LOCKED_STAR_MESSAGES.length)];
        setToast(message);
        if (timers.current.toast !== null) window.clearTimeout(timers.current.toast);
        timers.current.toast = window.setTimeout(() => setToast(null), TOAST_MS);
        return;
      }

      setToast(null);
      playSfx("starTap");
      setBurstingStarId(starId);
      timers.current.burst = window.setTimeout(
        () => {
          setBurstingStarId(null);
          setOpenStarId(starId);
        },
        reduced ? 0 : BURST_MS,
      );
    },
    [phase, burstingStarId, openStarId, memories, reduced],
  );

  const openMemory = openStarId ? (memories.getMemoryByStar(openStarId) ?? null) : null;
  const isReview = openStarId ? memories.getStarState(openStarId) === "discovered" : false;

  const onContinue = useCallback(() => {
    // Revisitar uma memoria antiga so fecha o cartao; a atual descobre e libera a proxima.
    if (openStarId && memories.getStarState(openStarId) === "available") {
      playSfx("discover");
      dispatch({ type: "DISCOVER_MEMORY" });
    }
    setOpenStarId(null);
  }, [openStarId, memories, dispatch]);

  return {
    starStates,
    burstingStarId,
    openMemory,
    isReview,
    toast,
    progress: { found: memories.discoveredCount, total: memories.total },
    onStarTap,
    onContinue,
  };
}
