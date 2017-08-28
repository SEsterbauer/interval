const Database = require('./Database');

class Storage {
  constructor(type, sessionId, callback) {
    if (!type || typeof type !== 'string') {
      throw new Error(`Storage: type must be a string, is ${typeof type}`);
    }
    if (!sessionId) {
      throw new Error('Storage: sessionId is missing');
    }
    this.type = type;
    this.sessionId = sessionId;
    this.store = [];
    this.db = new Database(type, () => {
      this.load(callback);
    });
  }
  load(callback) {
    this.db.getAllItemsBySessionId(this.sessionId, (items) => {
      this.store = items;
      console.log('Loaded store:', this.store);
      if (typeof callback === 'function') callback();
    });
  }
  add(items, callback) {
    console.log('Adding items', items);
    if (!items) throw new Error('Storage.add: items is empty');
    this.db.insertItems(items, this.sessionId, () => {
      this.load(callback);
    });
  }
  get(index) {
    return this.store[index];
  }
  count() {
    return this.store.length;
  }
}
module.exports = Storage;
