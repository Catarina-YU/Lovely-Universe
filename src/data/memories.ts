import type { Memory } from "@/types/types";

/**
 * Memorias do casal. EDITE AQUI: titulos, textos, datas e imagens.
 * Textos curtos de proposito: cada estrela guarda um pedacinho da historia.
 * Para usar uma imagem, coloque o arquivo em /public/assets/memories e informe
 * o caminho em `image`, ex.: "/assets/memories/primeira-foto.png".
 */
export const MEMORIES: readonly Memory[] = [
  {
    id: "onde-tudo-comecou",
    starId: "star-1",
    order: 1,
    title: "Onde tudo começou",
    text: "Tudo começou na academia, com um olhar que você deu antes de eu perceber. Depois, um story sobre um evento geek virou assunto, e o assunto virou a nossa primeira conversa. Foi só o começo.",
  },
  {
    id: "primeiras-lembrancas",
    starId: "star-2",
    order: 2,
    title: "Nossas primeiras lembranças",
    text: "Você passando de bicicleta, apressado, com o celular na boca. Eu, no ponto de ônibus, sorrindo sem querer. No nosso primeiro encontro, eu estava nervosa e encantada. E aquele perfume ficou: até hoje, quando sinto, lembro de você.",
  },
  {
    id: "o-que-amo-em-voce",
    starId: "star-3",
    order: 3,
    title: "O que amo em você",
    text: "O sorriso de canto, os olhos de jabuticaba, a covinha. O jeito firme de falar e o orgulho que sinto quando você explica o que sabe. O abraço onde eu aprendi a me deixar cuidar.",
  },
  {
    id: "momentos-favoritos",
    starId: "star-4",
    order: 4,
    title: "Nossos momentos favoritos",
    text: "Diz a lenda que o amor certo se encontra três vezes. Na terceira, você se atrasou de novo, e eu entendi que era assim que o destino ia nos fazer rir. Naquele dia, a moto me ensinou que ter medo também pode virar aventura.",
  },
  {
    id: "nosso-futuro",
    starId: "star-5",
    order: 5,
    title: "Nosso futuro",
    text: "Quero ser o seu porto seguro nos dias difíceis e a sua maior torcedora nos bons. Quero uma vida inteira ao seu lado, e imagino o tamanho do amor que ainda vamos construir.",
  },
  {
    id: "voce-e-meu-universo",
    starId: "star-6",
    order: 6,
    title: "Você é meu universo",
    text: "Dia 14 de novembro de 2025, a gente decidiu ser nós. Hoje, um ano depois, eu sigo a mulher mais apaixonada do universo, e o motivo é você. Feliz 1 ano, Pedro. Eu te amo, infinitamente.",
    date: "14 de novembro de 2026",
  },
];
