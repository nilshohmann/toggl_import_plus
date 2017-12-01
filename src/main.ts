import { app, BrowserWindow, globalShortcut } from "electron";
import * as path from "path";
import * as url from "url";

let mainWindow: Electron.BrowserWindow = null;

function createWindow() {
  if (mainWindow !== null) {
    return;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 640,
    icon: path.join(__dirname, "../assets/icons/png/64x64.png"),
    minHeight: 500,
    minWidth: 700,
    title: "Toggl import",
    // titleBarStyle: "hidden",
    width: 1024,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../index.html"),
      protocol: "file:",
      slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools({ mode: "detach" });

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  if (process.platform === "darwin") {
    globalShortcut.register("Command+N", createWindow);
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On OS X it"s common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on("activate", createWindow);
