const { app, BrowserWindow, Tray, Menu, screen } = require("electron");
const path = require("path");

let win;
let tray;
let isQuiting = false;

// ✅ SINGLE INSTANCE LOCK
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });
}

// ✅ ICON PATH (works in dev + AppImage)
const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, "build/icon.png")
  : path.join(__dirname, "build/icon.png");

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
    icon: iconPath, // ✅ FIXED
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");

  // Top-right position
  win.setPosition(width - 270, 20);

  // Prevent close → hide instead
  win.on("close", (e) => {
    if (!isQuiting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  tray = new Tray(iconPath); // ✅ FIXED

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
        isQuiting = true;
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

// Clean tray on exit
app.on("before-quit", () => {
  isQuiting = true;
  if (tray) tray.destroy();
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});