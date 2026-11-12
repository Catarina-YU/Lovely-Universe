"use client";

import { Horizon } from "@/components/pixi/Horizon";
import { Moon } from "@/components/pixi/Moon";
import { NightSky } from "@/components/pixi/NightSky";
import { useStage } from "@/components/pixi/PixiStage";
import { IntroTitle } from "@/features/introduction/IntroTitle";
import type { SceneParts } from "@/types/types";

function IntroWorld() {
  const { width, height } = useStage();
  return (
    <>
      <NightSky seed={11} />
      <Moon x={Math.round(width * 0.78)} y={Math.max(26, Math.round(height * 0.2))} />
      <Horizon />
    </>
  );
}

/** Tela 1: ceu estrelado, lua, titulo e botao para comecar. */
export function createIntroScene({ onStart }: { onStart: () => void }): SceneParts {
  return { world: <IntroWorld />, overlay: <IntroTitle onStart={onStart} /> };
}
