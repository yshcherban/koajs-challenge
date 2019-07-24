const sqlite3 = require('sqlite3').verbose();
const dbFileName = 'sqlite.db';

const DB = new sqlite3.Database(dbFileName, err => {
  if (err) {
    console.log(err)
    return
  }
});

module.exports = DB;
