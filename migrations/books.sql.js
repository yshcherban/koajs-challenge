const sqlite3 = require('sqlite3').verbose()
const dbConnector = require('../tools/dbConnector');

const dbSchema = `
  CREATE TABLE IF NOT EXISTS Books (
    id integer primary key autoincrement,
    title varchar(200),
    description varchar(350),
    image varchar(200),
    date DATE
  );

  CREATE TABLE IF NOT EXISTS BooksAuthors (
    id integer primary key autoincrement,
    book_id integer REFERENCES Books(id),
    author_id integer REFERENCES Authors(id)
  );

  CREATE TABLE IF NOT EXISTS Authors (
    id integer primary key autoincrement,
    firstname varchar(100) NOT NULL,
    lastname varchar(100) NOT NULL
  );

`;

dbConnector.exec(dbSchema, err => {
  if (err) {
    console.log(err);
  }
  console.log('Database successfully created');
});

dbConnector.close(() => {
    console.log('Database connection closed');
});
