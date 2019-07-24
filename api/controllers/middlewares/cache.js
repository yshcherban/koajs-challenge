const NodeCache = require('node-cache')

// stdTTL: time to live in seconds for every generated cache element.
const cache = new NodeCache({ stdTTL: 20 })

function getUrlFromRequest(ctx) {
  const url = ctx.protocol + '://' + ctx.headers.host + ctx.originalUrl
  return url;
}

async function set(ctx, next) {
  const url = getUrlFromRequest(ctx)
  cache.set(url, ctx.body);
  await next();
}

async function get(ctx, next) {
  const url = getUrlFromRequest(ctx);
  const content = cache.get(url);

  if (content) {
    ctx.body = content;
    return;
  }
  await next();
}

module.exports = { get, set }
