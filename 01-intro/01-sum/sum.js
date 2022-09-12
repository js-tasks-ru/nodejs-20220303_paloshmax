function sum(a, b) {
  /* ваш код */
  if (typeof a !== 'number' || typeof b !== 'number') throw TypeError('Incorrect types');
  return a + b;
}

module.exports = sum;
