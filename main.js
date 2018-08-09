const { app } = require('electron');
const tray = require('./tray/index');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', tray);

// use LSUIElement instead of dock.hide since it leaves the
// menu visible when in fullscreen
// app.dock.hide();

// // Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
