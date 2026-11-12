// App de desktop do "Nosso Universo": abre o jogo (site estatico em ./site) numa janela propria.
const { app, BrowserWindow, Menu, net, protocol } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const SITE_DIR = path.join(__dirname, "site");

// O jogo usa caminhos como "/_next/..." e "/assets/...": servimos o site por um protocolo
// proprio (app://jogo/) em vez de file://, para esses caminhos continuarem funcionando.
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 500,
    show: false,
    title: "Nosso Universo",
    backgroundColor: "#0b1033",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: { contextIsolation: true, sandbox: true },
  });

  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });

  // F11 alterna tela cheia.
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });

  win.loadURL("app://jogo/");
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);

    protocol.handle("app", (request) => {
      const url = new URL(request.url);
      // O Pixi resolve "/assets/x.png" como "app://assets/x.png" (o primeiro trecho vira o "host").
      // Quando o host nao e o nosso, devolvemos esse trecho ao caminho.
      const fullPath = url.hostname === "jogo" ? url.pathname : "/" + url.hostname + url.pathname;
      const relative = decodeURIComponent(fullPath === "/" ? "/index.html" : fullPath);
      const file = path.normalize(path.join(SITE_DIR, relative));
      // nunca sai da pasta do site
      if (!file.startsWith(SITE_DIR)) return new Response("Acesso negado", { status: 403 });
      return net.fetch(pathToFileURL(file).toString());
    });

    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on("window-all-closed", () => app.quit());
}
