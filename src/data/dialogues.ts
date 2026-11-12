/** Todos os textos fixos do jogo (pt-BR). Edite aqui. */
export const INTRO_TEXT = {
  title: "NOSSO UNIVERSO",
  tagline: "Em meio a tantas estrelas, uma história só nossa.",
  start: "▶ VAMOS COMEÇAR",
} as const;

export const MEETING_TEXT = {
  prompt: "[ E ] ENCONTRAR",
  interact: "[ E ] INTERAGIR",
  catSpeech: "Pikita está deitchada, volte mais tarde.",
  hintDesktop: "Use W A S D para andar",
} as const;

/** Falas da introducao a dinamica das estrelas (tela 4). */
export const STARGAZING_DIALOGUE: readonly string[] = [
  "Olha quantas estrelas existem aqui...",
  "Engraçado pensar que, em um universo tão grande, encontramos um ao outro.",
  "Sabe o que eu pensei? Cada estrela poderia guardar uma pequena parte da nossa história.",
];

export const CHOOSE_STAR_TEXT = "Escolha uma estrela e descubra o que ela guarda para nós.";

/** Mensagens exibidas ao clicar em uma estrela bloqueada. */
export const LOCKED_STAR_MESSAGES: readonly string[] = [
  "Calma, explorador... ainda existem outras histórias para descobrir.",
  "Essa estrela ainda está dormindo. Vá com calma!",
  "Cada coisa a seu tempo, essa história ainda vai brilhar.",
];

export const MEMORY_TEXT = {
  continue: "CONTINUAR",
  close: "FECHAR",
  hint: "Clique na estrela que está brilhando.",
  progress: (found: number, total: number) => `${found}/${total} ESTRELAS`,
} as const;

export const FINALE_TEXT = {
  message: "Entre todas as estrelas que poderia encontrar, você sempre será minha favorita.",
  replay: "REVIVER NOSSO UNIVERSO",
} as const;

export const SETTINGS_TEXT = {
  open: "MENU",
  title: "CONFIGURAÇÕES",
  soundOn: "SOM: LIGADO",
  soundOff: "SOM: DESLIGADO",
  restart: "REINICIAR PROGRESSO",
  restartConfirm: "Isso apaga as estrelas descobertas e volta ao início. Tem certeza?",
  restartYes: "SIM, REINICIAR",
  restartNo: "CANCELAR",
  close: "FECHAR",
} as const;
