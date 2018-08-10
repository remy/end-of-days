const { app, Menu, Tray, nativeImage } = require('electron');
const blocker = require('../blocker/index');
const path = require('path');

app.dock.hide();

const idleIcon = nativeImage.createFromPath(
  path.join(__dirname, 'idle_16x16.png')
);
idleIcon.setTemplateImage(true);

const activeIcon = nativeImage.createFromPath(
  path.join(__dirname, 'icon_16x16.png')
);
activeIcon.setTemplateImage(true);

let dismissTimeout = 1;
let tray = null;
let blockerWindow = null;
let due = '22:00';

function updateTimeout(menuItem) {
  dismissTimeout = menuItem.value;
}

function startBlocker() {
  app.dock.show(); // allows the blocker to be completely fullscreen
  blockerWindow = blocker();
}

function closeBlocker() {
  app.emit('can-quit', true);
  app.dock.hide();
  if (blockerWindow) {
    blockerWindow.destroy();
    blockerWindow = null;
    tray.setImage(idleIcon);
  }
}

function getTime(d) {
  return `${d
    .getHours()
    .toString()
    .padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

setInterval(() => {
  const now = new Date();
  const hour = now.getHours();
  const time = getTime(now);

  if (tray && (blockerWindow || hour > 21)) {
    tray.setImage(activeIcon);
  } else if (!blockerWindow) {
    tray.setImage(idleIcon);
  }

  if (hour < 4 && blockerWindow) {
    due = '22:00'; // reset time
    return closeBlocker();
  }

  if (time >= due && !blockerWindow) {
    startBlocker();
  }
}, 1000 * 30);

// closing closes for 20 minutes
app.on('close-blocker', () => {
  closeBlocker();
  let now = Date.now();
  now += 1000 * 60 * dismissTimeout;
  due = getTime(new Date(now));
});

module.exports = function createTray() {
  tray = new Tray(idleIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Bedtime',
      click: () => {
        tray.setImage(activeIcon);
        startBlocker();
      },
    },
    { label: 'About', role: 'about' },
    { type: 'separator' },
    { label: 'Dismiss timeout', enabled: false },
    {
      type: 'radio',
      label: '1 minute',
      checked: true,
      click: updateTimeout,
      value: 1,
    },
    { type: 'radio', label: '2 minutes', click: updateTimeout, value: 2 },
    { type: 'radio', label: '5 minutes', click: updateTimeout, value: 5 },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
};
