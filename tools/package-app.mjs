// Empacota o jogo como app de Windows (pasta com "Nosso Universo.exe") e gera um .zip para enviar.
// Uso: npm run app:build
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packager } from "@electron/packager";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(root, "dist-app");
const STAGING = path.join(OUT_DIR, "staging");
const APP_NAME = "Nosso Universo";

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) throw new Error(`Falhou: ${command} ${args.join(" ")}`);
}

console.log("1/4  Gerando o site estatico...");
run("npx", ["next", "build"], { APP_BUILD: "1" });

console.log("2/4  Preparando os arquivos do app...");
fs.rmSync(STAGING, { recursive: true, force: true });
fs.mkdirSync(STAGING, { recursive: true });
fs.cpSync(path.join(root, ".next-app"), path.join(STAGING, "site"), { recursive: true });
fs.copyFileSync(path.join(root, "electron", "main.cjs"), path.join(STAGING, "main.cjs"));
if (!fs.existsSync(path.join(root, "electron", "icon.ico"))) run("node", ["tools/make-icon.mjs"]);
fs.copyFileSync(path.join(root, "electron", "icon.ico"), path.join(STAGING, "icon.ico"));
fs.writeFileSync(
  path.join(STAGING, "package.json"),
  JSON.stringify({ name: "nosso-universo", productName: APP_NAME, version: "1.0.0", main: "main.cjs" }, null, 2),
);

console.log("3/4  Criando o executavel (baixa o Electron na primeira vez)...");
const [appDir] = await packager({
  dir: STAGING,
  name: APP_NAME,
  platform: "win32",
  arch: "x64",
  out: OUT_DIR,
  overwrite: true,
  icon: path.join(root, "electron", "icon.ico"),
  asar: false,
  prune: false,
  appCopyright: "Nosso Universo",
});
fs.writeFileSync(
  path.join(appDir, "LEIA-ME.txt"),
  [
    "NOSSO UNIVERSO",
    "",
    "1. Extraia (descompacte) esta pasta inteira, de preferencia na Area de Trabalho.",
    `2. Abra o arquivo "${APP_NAME}.exe".`,
    "",
    "Dicas: use W A S D para andar e a tecla E para interagir. F11 alterna tela cheia.",
    "Se o Windows avisar que o aplicativo e desconhecido, clique em Mais informacoes > Executar assim mesmo.",
    "",
  ].join("\r\n"),
);
fs.rmSync(STAGING, { recursive: true, force: true });

console.log("4/4  Compactando em .zip...");
const zip = path.join(OUT_DIR, `${APP_NAME}.zip`);
fs.rmSync(zip, { force: true });
run("powershell", [
  "-NoProfile",
  "-Command",
  `"Compress-Archive -Path '${appDir.replaceAll("'", "''")}' -DestinationPath '${zip.replaceAll("'", "''")}' -CompressionLevel Optimal"`,
]);

console.log(`\nPronto!\n  App:  ${appDir}\n  Zip:  ${zip}`);
