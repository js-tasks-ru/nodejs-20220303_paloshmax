const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const connections = [];
const connect = (id) => {
  return new Promise((res, rej) => {
    connections.push({ id, resolve: (data) => res(data) });
  });
};

router.get('/subscribe', async (ctx, next) => {
  /// r - параметр из index.html
  const connectionId = ctx.request.query.r;
  const message = await connect(connectionId);

  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;
  if (message) {
    connections.forEach((connection) => {
      connection.resolve(message);
      ctx.body = message;
    });
    return;
  }
  ctx.body = 'No message';
});

app.use(router.routes());

module.exports = app;
