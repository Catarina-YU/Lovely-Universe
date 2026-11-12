"use client";

import type { ComponentProps } from "react";
import { Character } from "../Character";

type MaleCharacterProps = Omit<ComponentProps<typeof Character>, "id">;

/** Pedro. */
export function MaleCharacter(props: MaleCharacterProps) {
  return <Character id="pedro" {...props} />;
}
