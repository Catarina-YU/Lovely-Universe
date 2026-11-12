"use client";

import { Application, useApplication } from "@pixi/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useStageSize } from "@/hooks/useStageSize";
import { COLORS } from "@/lib/constants";
import { StageContext } from "./StageContext";

interface PixiStageProps {
  /** Elementos Pixi (<pixiContainer>, <pixiGraphics>...). */
  children: ReactNode;
  /** Interface em React (DOM) desenhada por cima do canvas. */
  overlay?: ReactNode;
}

/** Mantem o renderer com o mesmo tamanho logico do palco quando a janela muda. */
function RendererSync({ width, height }: { width: number; height: number }) {
  const { app, isInitialised } = useApplication();
  useEffect(() => {
    if (isInitialised && app?.renderer) app.renderer.resize(width, height);
  }, [app, isInitialised, width, height]);
  return null;
}

/**
 * Palco Pixi em resolucao logica pequena, ampliado com escala inteira
 * (pixels nitidos). O canvas preenche a tela e a interface React fica por cima.
 */
export function PixiStage({ children, overlay }: PixiStageProps) {
  const size = useStageSize();
  // So monta os filhos depois que o Application iniciou: se os filhos mudarem durante a
  // inicializacao assincrona, a renderizacao antiga (obsoleta) chega por ultimo e vence.
  const [ready, setReady] = useState(false);
  const handleInit = useCallback(() => setReady(true), []);

  return (
    <StageContext.Provider value={size}>
      <div
        className="relative overflow-hidden bg-night-900"
        style={{ width: size.width * size.scale, height: size.height * size.scale }}
      >
        <Application
          width={size.width}
          height={size.height}
          background={COLORS.night900}
          antialias={false}
          resolution={1}
          autoDensity={false}
          roundPixels
          className="pixelated h-full w-full"
          onInit={handleInit}
        >
          {ready && (
            <>
              <RendererSync width={size.width} height={size.height} />
              {children}
            </>
          )}
        </Application>
        {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
      </div>
    </StageContext.Provider>
  );
}
