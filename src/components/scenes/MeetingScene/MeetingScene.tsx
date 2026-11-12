"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playSfx } from "@/core/audio/audioEngine";
import { MEETING_TEXT } from "@/data/dialogues";
import { MEETING_WORLD } from "@/data/meetingWorld";
import type { InteractableId, MeetingControls, SpeechBubble } from "@/features/meeting/meeting.types";
import { MeetingOverlay } from "@/features/meeting/MeetingOverlay";
import { MeetingWorld } from "@/features/meeting/MeetingWorld";
import type { SceneParts, Vec2 } from "@/types/types";

/** Quanto tempo o balao da gata fica na tela (e o Pedro fica parado). */
const BUBBLE_MS = 3400;

interface MeetingSceneOptions {
  /** Muda a cada nova partida; zera o estado da tela de encontro. */
  sessionKey: number;
  onEncounter: (pedroPosition: Vec2) => void;
}

interface MeetingUiState {
  sessionKey: number;
  nearId: InteractableId | null;
  hasMoved: boolean;
  bubble: SpeechBubble | null;
}

const freshState = (sessionKey: number): MeetingUiState => ({
  sessionKey,
  nearId: null,
  hasMoved: false,
  bubble: null,
});

/** Tela 2: o jogador controla o Pedro (WASD) ate encontrar a Catarina; a gata tem uma interacao propria. */
export function useMeetingScene({ sessionKey, onEncounter }: MeetingSceneOptions): SceneParts {
  const controlsRef = useRef<MeetingControls | null>(null);
  const bubbleTimer = useRef<number | null>(null);
  const [ui, setUi] = useState<MeetingUiState>(() => freshState(sessionKey));
  const current = ui.sessionKey === sessionKey ? ui : freshState(sessionKey);

  useEffect(
    () => () => {
      if (bubbleTimer.current !== null) window.clearTimeout(bubbleTimer.current);
    },
    [],
  );

  const patch = useCallback(
    (changes: Partial<Omit<MeetingUiState, "sessionKey">>) =>
      setUi((prev) => ({ ...(prev.sessionKey === sessionKey ? prev : freshState(sessionKey)), ...changes })),
    [sessionKey],
  );

  const handleNearChange = useCallback(
    (nearId: InteractableId | null) => {
      if (nearId) playSfx("prompt");
      patch({ nearId });
    },
    [patch],
  );
  const handleFirstMove = useCallback(() => patch({ hasMoved: true }), [patch]);

  const handleCatSpeak = useCallback(
    (point: Vec2) => {
      playSfx("meow");
      patch({ bubble: { x: point.x, y: point.y, text: MEETING_TEXT.catSpeech } });
      if (bubbleTimer.current !== null) window.clearTimeout(bubbleTimer.current);
      bubbleTimer.current = window.setTimeout(() => patch({ bubble: null }), BUBBLE_MS);
    },
    [patch],
  );

  return {
    world: (
      <MeetingWorld
        key={sessionKey}
        world={MEETING_WORLD}
        controlsRef={controlsRef}
        frozen={current.bubble !== null}
        onNearChange={handleNearChange}
        onFirstMove={handleFirstMove}
        onEncounter={onEncounter}
        onCatSpeak={handleCatSpeak}
      />
    ),
    overlay: (
      <MeetingOverlay
        nearId={current.bubble ? null : current.nearId}
        hasMoved={current.hasMoved}
        bubble={current.bubble}
        onInteract={() => controlsRef.current?.interact()}
      />
    ),
  };
}
