"use client";

import { Assets, Rectangle, Texture } from "pixi.js";
import { useEffect, useState } from "react";
import { CHARACTERS, SPRITE_MANIFEST } from "@/data/characters";
import type { AnimationName, CharacterId } from "@/types/types";

export type CharacterFrames = Record<AnimationName, Texture[]>;

const cache = new Map<CharacterId, Promise<CharacterFrames>>();

async function loadFrames(id: CharacterId): Promise<CharacterFrames> {
  const sheet = await Assets.load<Texture>(CHARACTERS[id].sheet);
  sheet.source.scaleMode = "nearest";
  const { frameWidth, frameHeight, animations } = SPRITE_MANIFEST;
  const frames = {} as CharacterFrames;
  for (const name of Object.keys(animations) as AnimationName[]) {
    const { row, frames: count } = animations[name];
    frames[name] = Array.from(
      { length: count },
      (_, i) =>
        new Texture({
          source: sheet.source,
          frame: new Rectangle(i * frameWidth, row * frameHeight, frameWidth, frameHeight),
        }),
    );
  }
  return frames;
}

/** Carrega (uma unica vez) e recorta o spritesheet de um personagem. */
export function useCharacterFrames(id: CharacterId): CharacterFrames | null {
  const [frames, setFrames] = useState<CharacterFrames | null>(null);

  useEffect(() => {
    let cancelled = false;
    let promise = cache.get(id);
    if (!promise) {
      promise = loadFrames(id);
      cache.set(id, promise);
    }
    promise.then((loaded) => {
      if (!cancelled) setFrames(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return frames;
}
