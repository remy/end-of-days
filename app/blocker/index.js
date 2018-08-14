const electron = require('electron');
const { app, BrowserWindow } = electron;
const prod = !require('../is-dev');

let canQuit = false;

app.on('can-quit', (value = true) => {
  canQuit = value;
});

module.exports = function createWindow() {
  let mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    frame: false,
    simpleFullscreen: true,
    show: false,
    backgroundColor: '#000',
    alwaysOnTop: prod,
    closable: false,
    movable: false,
    resizable: false,
    title: 'Bedtime 💤',
    y: 0,
    x: 0,
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(__dirname + '/index.html');
  mainWindow.setSimpleFullScreen(true);

  canQuit = false;

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // prevent blurring when we're open
  mainWindow.on('blur', () => mainWindow.focus());

  // Emitted when the window is closed.
  mainWindow.on('closed', e => {
    if (canQuit) {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    } else {
      /* the user only tried to close the window */
      e.preventDefault();
    }
  });

  return mainWindow;
};
