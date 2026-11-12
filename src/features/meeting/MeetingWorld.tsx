"use client";

import type { Container } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { FemaleCharacter } from "@/components/characters/FemaleCharacter";
import { MaleCharacter } from "@/components/characters/MaleCharacter";
import { useStage } from "@/components/pixi/PixiStage";
import { computeCamera, createEmptyInput, feetBox } from "@/core/movement/movement";
import type { MoveInput } from "@/core/movement/movement.types";
import { WorldView } from "@/features/world/WorldView";
import { useCharacterMovement } from "@/hooks/useCharacterMovement";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import type { CharacterHandle, Interactable, Vec2, WorldConfig } from "@/types/types";
import type { InteractableId, MeetingControls } from "./meeting.types";

/** Altura (em pixels do jogo) da cabeca do Pedro acima dos pes, onde nasce o balao de fala. */
const PEDRO_HEAD_HEIGHT = 50;

/** Distancia (entre os pes) para interagir com a gata deitada. */
const CAT_INTERACT_DISTANCE = 30;

interface MeetingWorldProps {
  world: WorldConfig;
  /** A interface chama `controlsRef.current.interact()` ao clicar no aviso. */
  controlsRef: RefObject<MeetingControls | null>;
  /** Parado enquanto o balao de fala da gata esta na tela. */
  frozen: boolean;
  onNearChange: (id: InteractableId | null) => void;
  onFirstMove: () => void;
  /** Jogador apertou E perto da Catarina; recebe onde o Pedro estava. */
  onEncounter: (pedroPosition: Vec2) => void;
  /** Jogador apertou E perto da gata; recebe o ponto da tela (em pixels) acima da cabeca do Pedro. */
  onCatSpeak: (screenPoint: Vec2) => void;
}

/** Cenario do encontro: WASD move o Pedro, a camera o segue e a Catarina espera. */
export function MeetingWorld({
  world,
  controlsRef,
  frozen,
  onNearChange,
  onFirstMove,
  onEncounter,
  onCatSpeak,
}: MeetingWorldProps) {
  const stage = useStage();
  const worldRef = useRef<Container | null>(null);
  const pedroRef = useRef<CharacterHandle | null>(null);
  const inputRef = useRef<MoveInput>(createEmptyInput());
  const positionRef = useRef<Vec2>({ ...world.spawn });
  const nearRef = useRef<InteractableId | null>(null);

  const cat = useMemo(() => world.obstacles.find((o) => o.kind === "cat"), [world]);

  // A Catarina tambem e um obstaculo: o Pedro nao a atravessa.
  const blockers = useMemo(
    () => [...world.obstacles.map((o) => o.hitbox), feetBox(world.catarina.x, world.catarina.y)],
    [world],
  );

  const interactables = useMemo<Interactable[]>(
    () => [
      { id: "catarina", position: world.catarina, distance: world.interactDistance },
      ...(cat ? [{ id: "cat", position: { x: cat.x, y: cat.y }, distance: CAT_INTERACT_DISTANCE }] : []),
    ],
    [world, cat],
  );

  const handleNear = useCallback(
    (id: string | null) => {
      nearRef.current = id as InteractableId | null;
      onNearChange(nearRef.current);
    },
    [onNearChange],
  );

  const interact = useCallback(() => {
    if (frozen) return;
    if (nearRef.current === "catarina") {
      onEncounter({ ...positionRef.current });
    } else if (nearRef.current === "cat" && cat) {
      const container = worldRef.current;
      if (!container) return;
      // o balao sai da cabeca do Pedro (ponto da tela, em pixels)
      const pedro = positionRef.current;
      onCatSpeak({
        x: (container.position.x + pedro.x) * stage.scale,
        y: (container.position.y + pedro.y - PEDRO_HEAD_HEIGHT) * stage.scale,
      });
    }
  }, [frozen, cat, stage.scale, onEncounter, onCatSpeak]);

  useKeyboardControls({ inputRef, enabled: true, onInteract: interact });

  useEffect(() => {
    controlsRef.current = { interact };
    return () => {
      controlsRef.current = null;
    };
  }, [controlsRef, interact]);

  const onUpdate = useCallback(
    (position: Vec2) => {
      const container = worldRef.current;
      if (!container) return;
      const camera = computeCamera(position, stage, world.width, world.height);
      container.position.set(-camera.x, -camera.y);
    },
    [stage, world],
  );

  useCharacterMovement({
    handleRef: pedroRef,
    inputRef,
    positionRef,
    initial: world.spawn,
    bounds: world.bounds,
    blockers,
    interactables,
    frozen,
    onNearChange: handleNear,
    onFirstMove,
    onUpdate,
  });

  return (
    <WorldView world={world} skyGroundRatio={0.45} worldRef={worldRef}>
      <FemaleCharacter x={world.catarina.x} y={world.catarina.y} />
      <MaleCharacter ref={pedroRef} x={world.spawn.x} y={world.spawn.y} />
    </WorldView>
  );
}
