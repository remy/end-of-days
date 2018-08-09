/* eslint-env browser */

const prod = !require('../is-dev');
const { remote } = require('electron');
let canQuit = false;
const keys = new Map([
  [40, '▼'],
  [38, '▲'],
  [37, '◀'],
  [39, '▶'],
  [66, 'A'],
  [65, 'B'],
]);

const out = document.querySelector('#out');
const tip = document.querySelector('#tip');

if (prod) document.body.requestPointerLock();

// hide the notice soon after we're shown
setTimeout(() => {
  document.querySelector('#notice').classList.add('hidden');
}, 200);

function konami() {
  return new Promise(resolve => {
    // Keycodes for: ↑ ↑ ↓ ↓ ← → ← → B A
    const expectedPattern = '38384040373937396665';
    let rollingPattern = '';

    const listener = event => {
      rollingPattern += event.keyCode;

      if (!expectedPattern.startsWith(rollingPattern)) {
        rollingPattern = '';
        tip.hidden = true;
        tip.className = '';
        out.innerHTML = '';
        return;
      }

      out.innerHTML = keys.get(event.keyCode) || '';
      tip.hidden = false;

      tip.className = `_${rollingPattern.length / 2}`;

      if (rollingPattern === expectedPattern) {
        window.removeEventListener('keydown', listener);
        resolve();
      }
    };

    window.addEventListener('keydown', listener);
  });
}

konami().then(() => {
  remote.app.emit('can-quit');
  canQuit = true;
  setTimeout(() => {
    // special handling to exit since we're doing simple full screen
    remote.app.emit('close-blocker');
  }, 100);
});

window.onbeforeunload = function(e) {
  if (canQuit) return;
  e.returnValue = false;
};
