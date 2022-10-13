const stream = require('stream');
const { Buffer } = require('buffer');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  size = 0;
  constructor(options) {
    super(options);
    this.limit = options.limit ?? Infinity;
  }

  _transform(chunk, encoding, callback) {
    let sizeChunk = Buffer.byteLength(chunk, encoding);
    if (this.size + sizeChunk > this.limit) {
      callback(new LimitExceededError(), chunk);
    } else {
      this.size = this.size + sizeChunk;
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
