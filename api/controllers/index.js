const Koa = require('koa');
const Router = require('koa-router');
const dbConnector = require('../../tools/dbConnector');
const cache = require('./middlewares/cache.js');

const router = new Router();

router
  // Show all books +
  // If we have a lof of data, ofcourse we need to use Queries instead js ; )
  .get('/books', cache.get, async (ctx, next) => {
     const limit = ctx.query.limit;
     const sort = ctx.query.sort;
     const offset = ctx.query.offset;

    return new Promise(function(resolve, reject) {
      dbConnector.all(`SELECT * FROM Books b
                      LEFT JOIN BooksAuthors ba ON (b.id = ba.book_id)
                      LEFT JOIN Authors a ON (a.id = ba.author_id)`,
                      function(err, row){
                        let response = row;
                        if (limit) {
                          response = row.slice(0, limit);
                          ctx.body = response;
                        }

                        else if (sort) {
                          response = response.sort((a, b) => a.id < b.id);
                          ctx.body = response;
                        }
                        else if (offset) {
                          response = row.slice(offset - 1);
                          ctx.body = response;
                        } else {
                          ctx.body = row;
                        }

                        resolve(next());
                      });
    });

  }, cache.set)
  // Create book +
  .post('/books', (ctx, next) => {
    if (ctx.request.body.title) {
      const { title, description, image, date, authorFirstName, authorLastName } = ctx.request.body;

      if (authorFirstName && authorLastName) {


        const book = new Promise(function(resolve, reject) {
          dbConnector.run(`INSERT INTO
            Books(
              title,
              description,
              image,
              date
            ) VALUES (
              ?, ?, ?, ?
            )`, [
              title,
              description,
              image,
              date
            ], function(err, row){
              if (!err) {
                //bookId = this.lastID; // get last record id - book id
                ctx.status = 200;
              } else {
                console.log(err);
                ctx.status = 400;
              }
              //resolve();
              //setTimeout(resolve, 900, 'first');

              setTimeout(() => {
                resolve({book_id: this.lastID});
              })
          });
        });

        const author = new Promise(function(resolve, reject) {
          dbConnector.run(`INSERT INTO
            Authors(
              firstname,
              lastname
            ) VALUES (
              ?, ?
            )`, [
              authorFirstName,
              authorLastName
            ], function(err, row){
              if (!err) {
                authorId = this.lastID; // get last record id - author id
                ctx.status = 200;
              } else {
                console.log(err);
                ctx.status = 400;
              }
              //resolve();
              //setTimeout(resolve, 500, 'second');
              setTimeout(() => {
                resolve({author_id: this.lastID});
              })
          });
        });

        return Promise.all([book, author]).then((val) => {
          console.log('Books created, authors added to them');

          (function ([{book_id}, {author_id}]) {
            return new Promise(function(resolve, reject) {
              dbConnector.run(`INSERT INTO
                BooksAuthors(
                  book_id,
                  author_id
                ) VALUES (
                  ?, ?
                )`, [
                  book_id,
                  author_id
                ], function(err, row){
                  if (!err) {
                    ctx.status = 200;
                  } else {
                    console.log(err);
                    ctx.status = 400;
                  }
                  resolve();
                  //setTimeout(resolve, 100, 'third');
              });
            });

          })(val);

        });


      } else {
        return new Promise(function(resolve, reject) {
          dbConnector.run(`INSERT INTO
            Books(
              title,
              description,
              image,
              date
            ) VALUES (
              ?, ?, ?, ?
            )`, [
              title,
              description,
              image,
              date
            ], function(err, row){
              if (!err) {
                ctx.status = 200;
              } else {
                console.log(err);
                ctx.status = 400;
              }
              resolve();
          });
        });
      }

    } else {
      ctx.throw(400, 'title_required');
    }
  })
  // Update book
  // I think that's enough ;)
  .put('/books/:id', (ctx, next) => {
    const bookId = ctx.params.id;
    const { title, description, image, date, sts } = ctx.request.body;

    return new Promise(function(resolve, reject) {
      dbConnector.run(`UPDATE Books
        SET title='${title}', description='${description}' WHERE id=${bookId}`, function(err, row){
        if (!err) {
          ctx.status = 200;
        } else {
          console.log(err);
          ctx.status = 400;
        }
        resolve();
      });
    });

  })
  // Delete book + (This place - we remove only book, not authors -
  //you can pay me and I'll realease this feature next time ;) )
  .del('/books/:id', (ctx, next) => {
    const bookId = ctx.params.id;
    return new Promise(function(resolve, reject) {
      dbConnector.exec(
        `DELETE FROM Books WHERE id=${bookId};
        DELETE FROM BooksAuthors WHERE book_id=${bookId}`
        , function(err, row){
        if (!err) {
          ctx.status = 200;
        } else {
          ctx.status = 400;
        }
        resolve();
      });
    });
  });

module.exports = router;
