"use client";

import { useEffect, useState } from "react";
import { SETTINGS_TEXT } from "@/data/dialogues";
import { useMuted } from "@/hooks/useSound";
import { PixelButton } from "../PixelButton";

interface SettingsMenuProps {
  /** Apaga o progresso salvo e volta ao inicio. */
  onRestart: () => void;
}

/** Botao MENU no canto da tela e o painel com som e "reiniciar progresso". */
export function SettingsMenu({ onRestart }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { muted, setMuted } = useMuted();

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <PixelButton
        variant="secondary"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-40 min-h-9 px-3 py-2 text-xs"
      >
        {SETTINGS_TEXT.open}
      </PixelButton>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-night-900/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={SETTINGS_TEXT.title}
            className="pixel-box flex w-[min(92vw,26rem)] flex-col gap-4 p-5"
          >
            <h2 className="font-pixel text-sm text-gold">{SETTINGS_TEXT.title}</h2>

            <PixelButton variant="secondary" onClick={() => setMuted(!muted)} aria-pressed={!muted}>
              {muted ? SETTINGS_TEXT.soundOff : SETTINGS_TEXT.soundOn}
            </PixelButton>

            {confirming ? (
              <div className="flex flex-col gap-3">
                <p className="text-[24px] leading-snug">{SETTINGS_TEXT.restartConfirm}</p>
                <div className="flex gap-3">
                  <PixelButton
                    onClick={() => {
                      close();
                      onRestart();
                    }}
                    className="flex-1 text-xs"
                  >
                    {SETTINGS_TEXT.restartYes}
                  </PixelButton>
                  <PixelButton variant="secondary" onClick={() => setConfirming(false)} className="flex-1 text-xs">
                    {SETTINGS_TEXT.restartNo}
                  </PixelButton>
                </div>
              </div>
            ) : (
              <PixelButton variant="secondary" onClick={() => setConfirming(true)}>
                {SETTINGS_TEXT.restart}
              </PixelButton>
            )}

            <PixelButton onClick={close}>{SETTINGS_TEXT.close}</PixelButton>
          </section>
        </div>
      )}
    </>
  );
}
