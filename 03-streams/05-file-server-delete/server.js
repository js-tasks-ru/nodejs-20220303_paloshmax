const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (pathname.match(/\//g)?.length > 0) {
        res.statusCode = 400;
        res.end('Bad request');
        return;
      }
      fs.access(filepath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File is not exist');
            return;
          }
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }
        fs.unlink(filepath, () => {});
        res.statusCode = 200;
        res.end('File deleted');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
