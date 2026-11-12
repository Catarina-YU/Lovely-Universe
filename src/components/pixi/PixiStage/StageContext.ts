"use client";

import { createContext, useContext } from "react";
import type { StageSize } from "@/types/types";

export const StageContext = createContext<StageSize | null>(null);

/** Tamanho logico do palco atual; so funciona dentro de <PixiStage>. */
export function useStage(): StageSize {
  const stage = useContext(StageContext);
  if (!stage) throw new Error("useStage precisa estar dentro de <PixiStage>");
  return stage;
}
