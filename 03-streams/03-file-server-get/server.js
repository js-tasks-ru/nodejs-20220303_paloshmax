const http = require('http');
const path = require('path');
const fs = require('fs');

/// Изначально решал через fs.access, вычитал в одном учебнике
/// Потом вспомнил ваше видео и код был куда лаконичнее,
/// В результате сделал через отслеживание событий на потоке

const server = new http.Server();

server.on('request', (req, res) => {
  console.log('new connection');
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      const readStream = fs.createReadStream(filepath);
      readStream.pipe(res);

      readStream.on('error', (err) => {
        if (err.code === 'ENOENT') {
          if (pathname.match(/\//g)?.length > 0) {
            res.statusCode = 400;
            res.end('Bad request');
          } else {
            res.statusCode = 404;
            res.end('File not found');
          }
        } else {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });

      readStream.on('close', () => {
        console.log('closed stream');
      });

      /// В документации утверждается что это событие deprecated (во избежание лишних событий)
      /// Вместо него лучше использовать close
      req.on('close', () => {
        console.log('connection closed');
        /// Это событие всегда срабатывает, даже если обрыва не было
        /// Есть ли способ как-то отслеживать состояние readStream ?
        /// Стоит ли уничтожать поток в любом случае?
        readStream.destroy();
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
