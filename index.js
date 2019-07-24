const Koa = require('koa');
const router = require('./api/controllers');
const bodyParser = require('koa-bodyparser');
const filter = require('@koa/json-filter');

const app = new Koa();

app
  .use(bodyParser())
  .use(filter())
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(5000);
console.log(`Server running in http://localhost:5000`);
