"use client";

import dynamic from "next/dynamic";

// Pixi depende de window/WebGL: o jogo so existe no navegador (sem SSR).
const Game = dynamic(() => import("./Game"), { ssr: false });

export function GameClient() {
  return <Game />;
}
