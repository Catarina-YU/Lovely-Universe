"use client";

import type { ComponentProps } from "react";
import { Character } from "../Character";

type FemaleCharacterProps = Omit<ComponentProps<typeof Character>, "id">;

/** Catarina. */
export function FemaleCharacter(props: FemaleCharacterProps) {
  return <Character id="catarina" {...props} />;
}
