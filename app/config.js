const electron = require('electron');
const fs = require('fs');
const path = require('path');
const makeDir = require('make-dir');
const writeFileAtomic = require('write-file-atomic');

const plainObject = () => Object.create(null);

class Store {
  constructor(defaults) {
    const cwd = (electron.app || electron.remote.app).getPath('userData');

    this.path = path.resolve(cwd, 'config.json');

    const fileStore = this.store;
    const store = Object.assign(plainObject(), defaults, fileStore);
    this.store = store;
  }

  get(key, defaultValue) {
    const res = this.store[key];
    return res === undefined ? defaultValue : res;
  }

  set(key, value) {
    const { store } = this;

    if (typeof key === 'object') {
      for (const k of Object.keys(key)) {
        store[k] = key[k];
      }
    } else {
      store[key] = value;
    }

    this.store = store;
  }

  has(key) {
    return this.store[key] != null;
  }

  clear() {
    this.store = plainObject();
  }

  delete(key) {
    const { store } = this;
    delete store[key];
    this.store = store;
  }

  get store() {
    try {
      let data = fs.readFileSync(this.path, 'utf8');
      return Object.assign(plainObject(), JSON.parse(data));
    } catch (error) {
      if (error.code === 'ENOENT') {
        makeDir.sync(path.dirname(this.path));
        return plainObject();
      }

      if (error.name === 'SyntaxError') {
        return plainObject();
      }

      throw error;
    }
  }

  set store(value) {
    // Ensure the directory exists as it could have been deleted in the meantime
    makeDir.sync(path.dirname(this.path));

    let data = JSON.stringify(value, '', 2);

    writeFileAtomic.sync(this.path, data);
  }
}

module.exports = Store;
