"use client";

import { useState } from "react";
import { PixiStage } from "@/components/pixi/PixiStage";
import { createIntroScene } from "@/components/scenes/IntroScene";
import { useMeetingScene } from "@/components/scenes/MeetingScene";
import { useUniverseScene } from "@/components/scenes/UniverseScene";
import { ScreenFade } from "@/components/ui/ScreenFade";
import { SettingsMenu } from "@/components/ui/SettingsMenu";
import { GameProvider, useGame } from "@/core/game/GameProvider";
import { useSceneTransition } from "@/core/game/useSceneTransition";
import { useAudioUnlock } from "@/hooks/useSound";
import type { SceneParts, Vec2 } from "@/types/types";

function GameScreens() {
  const { state, dispatch } = useGame();
  const { covered, durationMs, transitionTo } = useSceneTransition();
  useAudioUnlock();
  // Onde o Pedro estava ao encontrar a Catarina; a cutscene comeca dali.
  const [pedroStart, setPedroStart] = useState<Vec2 | null>(null);
  // Muda a cada partida nova (zera o estado de tela do encontro).
  const [session, setSession] = useState(0);

  const { phase } = state;

  const meeting = useMeetingScene({
    sessionKey: session,
    onEncounter: (position) => {
      setPedroStart(position);
      transitionTo({ type: "ENCOUNTER" });
    },
  });

  const universe = useUniverseScene({
    phase,
    pedroStart,
    onSeated: () => dispatch({ type: "SEATED" }),
    onDialogueDone: () => dispatch({ type: "DIALOGUE_DONE" }),
    onReplay: () => transitionTo({ type: "REPLAY" }),
  });

  let scene: SceneParts;
  if (phase === "intro") {
    scene = createIntroScene({
      onStart: () => {
        setSession((n) => n + 1);
        transitionTo({ type: "START" });
      },
    });
  } else if (phase === "meeting") {
    scene = meeting;
  } else {
    scene = universe;
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-night-900">
      {/* Um unico palco Pixi para o jogo todo; trocar de cena so troca os filhos. */}
      <PixiStage overlay={scene.overlay}>{scene.world}</PixiStage>
      {/* Cobre a tela ate o progresso salvo ser lido e durante trocas de cena. */}
      <SettingsMenu onRestart={() => transitionTo({ type: "RESET" })} />
      <ScreenFade covered={covered || !state.hydrated} durationMs={durationMs} />
    </main>
  );
}

export default function Game() {
  return (
    <GameProvider>
      <GameScreens />
    </GameProvider>
  );
}
