Feito com Next.js (App Router), React, TypeScript, Tailwind CSS e PixiJS (`pixi.js` + `@pixi/react`). Pensado para abrir **no computador** (WASD para andar, `E` para interagir, mouse para as estrelas).

## Rodar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:3000
npm run build    # build de produção
npm run start    # serve o build
```

## Onde editar o conteúdo

| O quê | Arquivo |
| --- | --- |
| Títulos, textos, datas e fotos das 6 memórias | `src/data/memories.ts` |
| Falas, frases, mensagens das estrelas bloqueadas e mensagem final | `src/data/dialogues.ts` |
| Posição das 6 estrelas (formam o coração) | `src/data/stars.ts` |
| Campo, obstáculos, onde cada um começa e onde sentam | `src/data/meetingWorld.ts` |

Para colocar uma foto numa memória, copie o arquivo para `public/assets/memories/` e informe o caminho em `image`, por exemplo `"/assets/memories/foto.png"`.

## Estrutura

```
src/
├── app/                 layout, página e estilos globais
├── components/
│   ├── Game/            monta o jogo (um único palco Pixi para todas as cenas)
│   ├── scenes/          cenas: Intro, Meeting e Universe (mundo + interface)
│   ├── pixi/            PixiStage, NightSky, Moon, Horizon, ShootingStar
│   ├── characters/      Character (spritesheet animado), Pedro e Catarina
│   ├── stars/           Star, StarField, HeartConstellation
│   └── ui/              botões, diálogo, cartão de memória, menu etc. (DOM)
├── core/
│   ├── game/            máquina de fases e progresso salvo
│   ├── movement/        movimento, colisão e câmera (lógica pura)
│   ├── cutscene/        passos encadeáveis para cenas automáticas
│   └── audio/           música e efeitos sintetizados (Web Audio)
├── features/            meeting, memories, universe, world, introduction
├── hooks/               teclado, movimento, memórias, som, etc.
├── data/                conteúdo editável
├── lib/                 constantes e utilitários
└── types/               tipos compartilhados
```

Fases do jogo: `intro → meeting → sitting → dialogue → memories → finale`. O progresso das memórias é salvo no navegador (Menu → Reiniciar progresso apaga).

## Personagens (sprites)

Os spritesheets são desenhados em código. Para ajustar cores, roupas ou poses, edite `tools/sprites/generate.mjs` e rode:

```bash
node tools/sprites/generate.mjs
```

Isso regenera `public/assets/characters/*.png`, `src/data/sprite-manifest.json` e uma prévia em `tools/sprites/sheet-preview.png`.

## Notas técnicas

- O Pixi só roda no navegador (`ssr: false`), e existe **um único** `Application` durante todo o jogo: criar e destruir Applications entre cenas quebra a renderização.
- Use `usePixiTick` (em `src/hooks`) no lugar do `useTick` do `@pixi/react`; o original lança erro ao desmontar.
- Respeita `prefers-reduced-motion`.
