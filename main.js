const { app, BrowserWindow, Tray, Menu, screen } = require("electron");
const path = require("path");

let win;
let tray;

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 260,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    icon: path.join(__dirname, "build/icon.png"), // ✅ FIXED
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");

  // Top-right position
  win.setPosition(width - 270, 20);

  // Prevent closing (hide instead)
  win.on("close", (e) => {
    e.preventDefault();
    win.hide();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, "build/icon.png")); // ✅ FIXED

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Toggle Widget",
      click: () => {
        win.isVisible() ? win.hide() : win.show();
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip("System Widget");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    win.isVisible() ? win.hide() : win.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});