// Minimal stub for Node.js 'util' module
module.exports = {
  inspect: (obj, options) => {
    if (obj === null || obj === undefined) {
      return String(obj);
    }
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(obj);
    }
  },
  format: (format, ...args) => {
    if (typeof format !== 'string') {
      return [format, ...args].join(' ');
    }
    return format.replace(/%[sdj%]/g, (match) => {
      if (match === '%%') return '%';
      const arg = args.shift();
      if (arg === undefined) return match;
      if (match === '%s') return String(arg);
      if (match === '%d') return Number(arg);
      if (match === '%j') return JSON.stringify(arg);
      return match;
    }) + (args.length ? ' ' + args.join(' ') : '');
  },
  promisify: (fn) => {
    return function(...args) {
      return new Promise((resolve, reject) => {
        try {
          fn.call(this, ...args, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        } catch (e) {
          reject(e);
        }
      });
    };
  },
  inherits: (ctor, superCtor) => {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  },
  isArray: Array.isArray,
  isBoolean: (val) => typeof val === 'boolean',
  isNull: (val) => val === null,
  isNullOrUndefined: (val) => val === null || val === undefined,
  isNumber: (val) => typeof val === 'number',
  isString: (val) => typeof val === 'string',
  isSymbol: (val) => typeof val === 'symbol',
  isUndefined: (val) => val === undefined,
  isObject: (val) => val !== null && typeof val === 'object',
  isFunction: (val) => typeof val === 'function',
  isDate: (val) => val instanceof Date,
  isRegExp: (val) => val instanceof RegExp,
  isError: (val) => val instanceof Error,
  deprecate: (fn, msg) => fn,
};

