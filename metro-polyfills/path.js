// Minimal stub for Node.js 'path' module
// React Native has limited path support
module.exports = {
  join: (...args) => args.filter(Boolean).join('/'),
  resolve: (...args) => args.filter(Boolean).join('/'),
  dirname: (p) => p.split('/').slice(0, -1).join('/') || '.',
  basename: (p) => p.split('/').pop() || '',
  extname: (p) => {
    const parts = p.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  },
  sep: '/',
  delimiter: ':',
};

