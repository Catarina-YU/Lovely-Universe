import type { CharacterConfig, CharacterId, SpriteManifest } from "@/types/types";
import manifestJson from "./sprite-manifest.json";

/** Gerado por `node tools/sprites/generate.mjs` (mesmo layout para os dois personagens). */
export const SPRITE_MANIFEST = manifestJson as SpriteManifest;

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  pedro: { id: "pedro", name: "Pedro", sheet: "/assets/characters/pedro.png" },
  catarina: { id: "catarina", name: "Catarina", sheet: "/assets/characters/catarina.png" },
};
