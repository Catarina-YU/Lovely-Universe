"use client";

import { useEffect, useState } from "react";
import { GAME_HEIGHT } from "@/lib/constants";
import type { StageSize } from "@/types/types";

function computeStageSize(): StageSize {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Escala inteira: o lado menor da tela fica com ~GAME_HEIGHT pixels logicos.
  const scale = Math.max(1, Math.round(Math.min(vw, vh) / GAME_HEIGHT));
  return { width: Math.floor(vw / scale), height: Math.floor(vh / scale), scale };
}

/** Tamanho logico (pixel art) do palco e fator de escala inteiro para a tela. */
export function useStageSize(): StageSize {
  const [size, setSize] = useState<StageSize>(computeStageSize);

  useEffect(() => {
    const onResize = () => {
      const next = computeStageSize();
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height && prev.scale === next.scale
          ? prev
          : next,
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
