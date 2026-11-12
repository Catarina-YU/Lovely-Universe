"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted, unlock } from "@/core/audio/audioEngine";

/** Estado do som (ligado/desligado), salvo no navegador. */
export function useMuted(): { muted: boolean; setMuted: (value: boolean) => void } {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  return { muted, setMuted };
}

/** Libera o audio no primeiro gesto do usuario (clique ou tecla). */
export function useAudioUnlock(): void {
  useEffect(() => {
    const onGesture = () => {
      unlock();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);
}
