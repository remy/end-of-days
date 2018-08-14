const electron = require('electron');
const { app, Menu, Tray, nativeImage } = electron;
const blocker = require('../blocker/index');
const path = require('path');
const Config = require('../config');
const config = new Config({
  due: '22:00', // TODO make configurable
  dismissTimeout: 1,
});

app.dock.hide();

const idleIcon = nativeImage.createFromPath(
  path.join(__dirname, 'idle_16x16.png')
);
idleIcon.setTemplateImage(true);

const activeIcon = nativeImage.createFromPath(
  path.join(__dirname, 'icon_16x16.png')
);
activeIcon.setTemplateImage(true);

let { dismissTimeout, due } = config.store;

let tray = null;
let blockerWindow = null;
let contextMenu = null;

function updateTimeout(menuItem) {
  dismissTimeout = menuItem.value;
  config.set({ dismissTimeout });
}

function startBlocker() {
  tray.setImage(activeIcon);
  app.dock.show(); // allows the blocker to be completely fullscreen
  // setTimeout(() => {
  blockerWindow = blocker();
  // }, 100);
}

function closeBlocker() {
  app.emit('can-quit', true);
  app.dock.hide();
  if (blockerWindow) {
    blockerWindow.destroy();
    blockerWindow = null;
    tray.setImage(idleIcon);
    updateMenu();
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

const check = () => {
  const now = new Date();
  const hour = now.getHours();
  const time = getTime(now);

  if (tray && (blockerWindow || hour > 21)) {
    tray.setImage(activeIcon);
  } else if (!blockerWindow) {
    tray.setImage(idleIcon);
  }

  if (time < due && blockerWindow) {
    due = config.due; // reset time
    return closeBlocker();
  }

  if (time >= due && !blockerWindow) {
    startBlocker();
  }
};

setInterval(check, 1000 * 30);

// closing closes for 20 minutes
app.on('close-blocker', () => {
  let now = new Date();
  const time = getTime(now);

  // only add a snooze if we're bedtime
  if (time > config.due) {
    due = getTime(new Date(now.getTime() + 1000 * 60 * dismissTimeout));
  }
  closeBlocker();
});

function updateMenu() {
  if (!tray) return;

  tray.setToolTip(`Bedtime @ ${due}`);

  contextMenu = Menu.buildFromTemplate([
    {
      id: '1',
      label: `Bedtime @ ${due}`,
      click: startBlocker,
    },
    // { label: 'About', role: 'about' },
    { type: 'separator' },
    { label: 'Dismiss timeout', enabled: false },
    {
      type: 'radio',
      label: '1 minute',
      checked: dismissTimeout === 1,
      click: updateTimeout,
      value: 1,
    },
    {
      type: 'radio',
      label: '2 minutes',
      checked: dismissTimeout === 2,
      click: updateTimeout,
      value: 2,
    },
    {
      type: 'radio',
      label: '5 minutes',
      checked: dismissTimeout === 5,
      click: updateTimeout,
      value: 5,
    },
    { type: 'separator' },
    {
      label: 'Quit End of Days',
      accelerator: 'cmd+q',
      role: 'quit',
    },
  ]);
  tray.setContextMenu(contextMenu);
}

module.exports = function createTray() {
  tray = new Tray(idleIcon);
  updateMenu();
  check();
  electron.powerMonitor.on('resume', check);
};
