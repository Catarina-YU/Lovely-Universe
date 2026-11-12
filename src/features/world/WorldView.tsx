"use client";

import { extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, type ReactNode, type Ref } from "react";
import { Moon } from "@/components/pixi/Moon";
import { NightSky } from "@/components/pixi/NightSky";
import { useStage } from "@/components/pixi/PixiStage";
import { drawGround, drawObstacle } from "@/features/meeting/worldArt";
import type { WorldConfig } from "@/types/types";
import { SleepingCat } from "./SleepingCat";

extend({ Container, Graphics });

interface WorldViewProps {
  world: WorldConfig;
  /** Fracao inferior da tela sem estrelas de fundo. */
  skyGroundRatio: number;
  /** O container do mundo: quem controla a camera move este objeto. */
  worldRef: Ref<Container>;
  /** Desenhado entre o ceu e o mundo (ex.: estrela cadente). */
  inSky?: ReactNode;
  /** Personagens e outros elementos do mundo. */
  children?: ReactNode;
}

/** Ceu fixo + mundo (chao, obstaculos e personagens) que a camera move. */
export function WorldView({ world, skyGroundRatio, worldRef, inSky, children }: WorldViewProps) {
  const stage = useStage();
  const drawWorldGround = useCallback((g: Graphics) => drawGround(g, world), [world]);

  return (
    <>
      <NightSky seed={31} groundRatio={skyGroundRatio} />
      <Moon x={Math.round(stage.width * 0.8)} y={32} />
      {inSky}
      <pixiContainer ref={worldRef} sortableChildren>
        <pixiGraphics draw={drawWorldGround} zIndex={-2000} />
        {world.obstacles.map((o, i) =>
          o.kind === "cat" ? (
            <SleepingCat key={i} x={o.x} y={o.y} />
          ) : (
          <pixiGraphics
            key={i}
            x={o.x}
            y={o.y}
            zIndex={o.kind === "pond" ? -1000 : o.y}
            draw={(g: Graphics) => drawObstacle(g, o)}
          />
          ),
        )}
        {children}
      </pixiContainer>
    </>
  );
}
