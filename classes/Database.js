const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(fileName, callback) {
    this.connect(fileName, callback);
  }
  connect(fileName, callback) {
    if (!this.db) {
      this.db = new sqlite3.Database(fileName ? `./db/${fileName}` : ':memory:');
      this.location = fileName;
    }
    this.getAllTables((tables) => {
      if (!Array.isArray(tables) || !tables.length) {
        this.migrate(() => {
          if (typeof callback === 'function') callback();
        });
        return;
      }
      if (typeof callback === 'function') callback();
    });
  }
  addTable(name, fields, callback) {
    this.db.serialize(() => {
      this.db.run(
        `CREATE TABLE ${name} (${Object.keys(fields).map(field => '"' + field + '"' + ' ' + fields[field]).join()})`,
        typeof callback === 'function' ? callback : undefined
      );
    });
  }
  getAllTables(callback) {
    if (typeof callback !== 'function') {
      throw new Error(`Database.getAllTables: callback must be a function, is ${typeof callback}`);
    }
    this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (error, tables) => {
      if (error) throw new Error(error);
      callback(tables.map((table) => table.name));
    });
  }
  migrate(callback) {
    this.addTable(this.location, {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      session_id: 'INTEGER NOT NULL',
      names: 'TEXT NOT NULL',
      values: 'TEXT NOT NULL',
      timestamp: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    }, (error) => {
      if (error) throw new Error(error);
      this.getAllTables((tables) => {
        console.log('Migrated new tables:', tables.join());
        if (typeof callback === 'function') callback();
      });
    });
  }
  insertItems(items, sessionId, callback) {
    this.db.run(
      `INSERT INTO ${this.location} ("session_id", "names", "values") VALUES (?, ?, ?)`,
      [sessionId, JSON.stringify(Object.keys(items)), JSON.stringify(Object.values(items))],
      (error) => {
        if (error) throw new Error(error);
        if (typeof callback === 'function') {
          callback(items);
        }
      }
    );
  }
  getAllItemsBySessionId(sessionId, callback) {
    if (!sessionId) {
      throw new Error(`Database.getAllItemsBySessionId: sessionId must be a valid integer > 0, is ${sessionId}`);
    }
    if (typeof callback !== 'function') {
      throw new Error(`Database.getAllItemsBySessionId: callback must be a function, is ${typeof callback}`);
    }
    this.db.all(
      `SELECT * FROM ${this.location} WHERE session_id = ?`,
      [sessionId],
      (error, items) => {
        if (error) throw new Error(error);
        callback(items.map(item => {
          item.names = JSON.parse(item.names);
          item.values = JSON.parse(item.values);
          return item;
        }));
      }
    );
  }
}
module.exports = Database;
