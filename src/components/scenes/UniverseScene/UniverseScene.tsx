"use client";

import { useEffect } from "react";
import { playSfx } from "@/core/audio/audioEngine";
import { MEETING_WORLD } from "@/data/meetingWorld";
import { useMemoryFlow } from "@/features/memories/useMemoryFlow";
import { UniverseOverlay } from "@/features/universe/UniverseOverlay";
import { UniverseWorld } from "@/features/universe/UniverseWorld";
import type { GamePhase, SceneParts, Vec2 } from "@/types/types";

interface UniverseSceneOptions {
  phase: GamePhase;
  pedroStart: Vec2 | null;
  onSeated: () => void;
  onDialogueDone: () => void;
  onReplay: () => void;
}

/** Telas 3 a 6: o casal senta, olha o ceu e descobre as memorias. Sem controle por teclado. */
export function useUniverseScene({
  phase,
  pedroStart,
  onSeated,
  onDialogueDone,
  onReplay,
}: UniverseSceneOptions): SceneParts {
  const flow = useMemoryFlow(phase);

  useEffect(() => {
    if (phase === "finale") playSfx("finale");
  }, [phase]);

  return {
    world: (
      <UniverseWorld
        world={MEETING_WORLD}
        phase={phase}
        pedroStart={pedroStart}
        onSeated={onSeated}
        starStates={flow.starStates}
        burstingStarId={flow.burstingStarId}
        onStarTap={flow.onStarTap}
      />
    ),
    overlay: (
      <UniverseOverlay
        phase={phase}
        progress={flow.progress}
        openMemory={flow.openMemory}
        isReview={flow.isReview}
        toast={flow.toast}
        onContinueMemory={flow.onContinue}
        onDialogueDone={onDialogueDone}
        onReplay={onReplay}
      />
    ),
  };
}
