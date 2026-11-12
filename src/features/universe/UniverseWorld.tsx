"use client";

import type { Container } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FemaleCharacter } from "@/components/characters/FemaleCharacter";
import { MaleCharacter } from "@/components/characters/MaleCharacter";
import { ShootingStar, type ShootingStarHandle } from "@/components/pixi/ShootingStar";
import { StarField } from "@/components/stars/StarField";
import { useStage } from "@/components/pixi/PixiStage";
import type { CutsceneActor, Step, StepRunner } from "@/core/cutscene/cutscene.types";
import { computeCamera, computeSeatedCamera } from "@/core/movement/movement";
import { buildSittingCutscene, seatPositions } from "@/features/meeting/sittingCutscene";
import { WorldView } from "@/features/world/WorldView";
import { playSfx } from "@/core/audio/audioEngine";
import { usePixiTick } from "@/hooks/usePixiTick";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CharacterHandle, GamePhase, StarState, Vec2, WorldConfig } from "@/types/types";

interface UniverseWorldProps {
  world: WorldConfig;
  phase: GamePhase;
  /** Onde o Pedro estava ao encontrar a Catarina (null = recarregou a pagina). */
  pedroStart: Vec2 | null;
  /** A cutscene terminou: os dois estao sentados. */
  onSeated: () => void;
  /** Estado de cada estrela interativa (por id). */
  starStates: Readonly<Record<string, StarState>>;
  /** Estrela em animacao de destaque. */
  burstingStarId: string | null;
  onStarTap: (starId: string) => void;
}

type CameraMode = "follow" | "pan" | "seated";

interface CameraState {
  mode: CameraMode;
  from: Vec2;
  progress: number;
  last: Vec2 | null;
}

const PAN_SECONDS = 2.4;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Mundo das telas 3 em diante. Na fase "sitting" roda a cutscene; nas demais
 * (ou ao recarregar com progresso salvo) o casal ja aparece sentado.
 */
export function UniverseWorld({
  world,
  phase,
  pedroStart,
  onSeated,
  starStates,
  burstingStarId,
  onStarTap,
}: UniverseWorldProps) {
  const stage = useStage();
  const reduced = useReducedMotion();
  const [startsSeated] = useState(phase !== "sitting");
  const seats = useMemo(() => seatPositions(world.sitSpot), [world]);

  const worldRef = useRef<Container | null>(null);
  const pedroRef = useRef<CharacterHandle | null>(null);
  const catarinaRef = useRef<CharacterHandle | null>(null);
  const starRef = useRef<ShootingStarHandle | null>(null);

  const [pedroInitial] = useState<Vec2>(() => (startsSeated ? seats.pedro : (pedroStart ?? world.spawn)));
  const [catarinaInitial] = useState<Vec2>(() => (startsSeated ? seats.catarina : world.catarina));

  const pedroActor = useRef<CutsceneActor>({ position: { ...pedroInitial }, handle: pedroRef });
  const catarinaActor = useRef<CutsceneActor>({ position: { ...catarinaInitial }, handle: catarinaRef });
  const camera = useRef<CameraState>({
    mode: startsSeated ? "seated" : "follow",
    from: { x: 0, y: 0 },
    progress: 0,
    last: null,
  });
  const runner = useRef<StepRunner | null>(null);
  const started = useRef(false);

  const onSeatedRef = useRef(onSeated);
  useEffect(() => {
    onSeatedRef.current = onSeated;
  });

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.05);

      // Inicia a cutscene so quando os dois spritesheets carregaram.
      if (!startsSeated && !started.current && pedroRef.current && catarinaRef.current) {
        started.current = true;
        const panCamera: Step = () => {
          camera.current.mode = "pan";
          camera.current.progress = 0;
          return () => camera.current.mode === "seated";
        };
        const shootingStar: Step = () => {
          let done = reduced || !starRef.current;
          if (!reduced) playSfx("shooting");
          starRef.current?.launch(() => {
            done = true;
          });
          return () => done;
        };
        runner.current = buildSittingCutscene({
          pedro: pedroActor.current,
          catarina: catarinaActor.current,
          spot: world.sitSpot,
          panCamera,
          shootingStar,
          onSeated: () => onSeatedRef.current(),
        })();
      }
      if (runner.current?.(dt)) runner.current = null;

      // Camera: segue os dois, sobe ate o ceu e fica parada.
      const cam = camera.current;
      const seatedCamera = computeSeatedCamera(world.sitSpot, stage);
      let target: Vec2;
      if (cam.mode === "follow") {
        const middle = {
          x: (pedroActor.current.position.x + catarinaActor.current.position.x) / 2,
          y: (pedroActor.current.position.y + catarinaActor.current.position.y) / 2,
        };
        target = computeCamera(middle, stage, world.width, world.height);
        cam.from = target;
      } else if (cam.mode === "pan") {
        cam.progress += dt / (reduced ? 0.01 : PAN_SECONDS);
        const e = easeInOut(Math.min(cam.progress, 1));
        target = {
          x: Math.round(cam.from.x + (seatedCamera.x - cam.from.x) * e),
          y: Math.round(cam.from.y + (seatedCamera.y - cam.from.y) * e),
        };
        if (cam.progress >= 1) cam.mode = "seated";
      } else {
        target = seatedCamera;
      }

      // So mexe no mundo quando a camera realmente mudou.
      if (!cam.last || cam.last.x !== target.x || cam.last.y !== target.y) {
        worldRef.current?.position.set(-target.x, -target.y);
        cam.last = target;
      }
    },
    [startsSeated, reduced, stage, world],
  );
  usePixiTick(tick);

  const sitAnimation = startsSeated ? "sit-back" : "idle-down";

  return (
    <WorldView
      world={world}
      skyGroundRatio={0.3}
      worldRef={worldRef}
      inSky={
        <>
          <ShootingStar ref={starRef} />
          {(phase === "memories" || phase === "finale") && (
            <StarField
              states={starStates}
              burstingId={burstingStarId}
              interactive={phase === "memories"}
              celebrate={phase === "finale"}
              onStarTap={onStarTap}
            />
          )}
        </>
      }
    >
      <FemaleCharacter
        ref={catarinaRef}
        x={catarinaInitial.x}
        y={catarinaInitial.y}
        initialAnimation={sitAnimation}
      />
      <MaleCharacter ref={pedroRef} x={pedroInitial.x} y={pedroInitial.y} initialAnimation={sitAnimation} />
    </WorldView>
  );
}
