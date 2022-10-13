const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const server = new http.Server();

/// Не понимаю, если отдать большой файл, и здесь сразу же отдать ответ
/// То ответ не будет отдан до тех пор пока файл не скачается
/// Почему???
/// Как оборвать запрос на отправку файла? Через postman это вообще неясно
server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      let sizeLimit = 1024 * 1024;
      /// Тест не проходит, хотя на деле все работает
      /// В тестах он не видит заголовок 'content-length'
      /// Я так понимаю там просто делается POST запрос без данных
      /// Отсюда этот простой код не работает
      if (req.headers['content-length'] > sizeLimit) {
        res.statusCode = 413;
        res.end(`Your content has size over than ${sizeLimit} bytes`);
        return;
      }

      if (pathname.match(/\//g)?.length > 0 || pathname === '') {
        res.statusCode = 400;
        res.end('Bad request');
        return;
      }

      const writeStream = fs.createWriteStream(filepath, { flags: 'wx' });
      const limitStream = new LimitSizeStream({ limit: sizeLimit });
      req.pipe(limitStream).pipe(writeStream);

      /// Как я писал ранее это событие является deprecated
      /// Как без него обойтись?
      req.on('aborted', () => {
        writeStream.destroy();
        limitStream.destroy();
        fs.unlink(filepath, () => {});
      });

      limitStream.on('error', (err) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end(`Your content has size over than ${sizeLimit} bytes`);
          fs.unlink(filepath, () => {});
          return;
        }
        res.statusCode = 500;
        res.end('Internal Server Error');
        fs.unlink(filepath, () => {});
      });

      writeStream.on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File is already exist');
          return;
        }
        res.statusCode = 500;
        res.end('Internal Server Error');
        fs.unlink(filepath, () => {});
      });

      writeStream.on('finish', () => {
        res.statusCode = 201;
        res.end('File has been created, data has been written');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
