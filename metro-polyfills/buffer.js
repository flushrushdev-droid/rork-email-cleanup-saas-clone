// Use the global Buffer if available, otherwise provide a minimal stub
// React Native may have Buffer available via polyfills
if (typeof Buffer !== 'undefined') {
  module.exports = Buffer;
} else {
  module.exports = {
    from: () => ({ toString: () => '' }),
    alloc: () => ({ toString: () => '' }),
    isBuffer: () => false,
  };
}

