const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  lastElement = null;
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    let dataStr = chunk.toString();
    if (this._lastElement) {
      dataStr = this._lastElement + dataStr;
    }
    let dataArr = dataStr.split(os.EOL);
    this._lastElement = dataArr.pop();
    for (let i = 0; i < dataArr.length; i++) {
      this.push(dataArr[i]);
    }
    callback();
  }

  _flush(callback) {
    if (this._lastElement) {
      this.push(this._lastElement);
    }
    this._lastElement = null;
    callback();
  }
}

module.exports = LineSplitStream;
