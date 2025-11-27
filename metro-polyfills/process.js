// Minimal stub for Node.js 'process' module
// Provide basic process.env support
// Ensure env is always an object with proper defaults and all properties are strings
const baseEnv = typeof process !== 'undefined' && process.env ? process.env : {};
// Create a proxy to ensure all env properties are strings (never undefined)
const env = new Proxy(baseEnv, {
  get(target, prop) {
    const value = target[prop];
    // Always return a string, never undefined
    return value !== undefined && value !== null ? String(value) : '';
  },
  has(target, prop) {
    return prop in target;
  },
  ownKeys(target) {
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(target, prop) || {
      enumerable: true,
      configurable: true,
      value: '',
    };
  },
});

module.exports = {
  env: env,
  version: 'v0.0.0',
  versions: {
    node: '0.0.0',
  },
  platform: 'react-native',
  arch: 'unknown',
  pid: 0,
  ppid: 0,
  nextTick: (fn) => setTimeout(fn, 0),
  exit: (code) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('process.exit called with code:', code);
    }
  },
  cwd: () => '/',
  argv: ['node'],
  argv0: 'node',
  execPath: 'node',
  title: 'node',
  stdin: null,
  stdout: null,
  stderr: null,
};

