// Empty stub for Node.js 'os' module
// This module is not available in React Native
// Match the actual Node.js API where properties are values, not functions
module.exports = {
  platform: 'react-native',
  arch: 'unknown',
  type: 'React Native',
  release: '0.0.0',
  hostname: () => 'localhost',
  homedir: () => '/',
  tmpdir: () => '/tmp',
  endianness: () => 'LE',
  EOL: '\n',
  cpus: () => [],
  totalmem: () => 0,
  freemem: () => 0,
  networkInterfaces: () => ({}),
  loadavg: () => [0, 0, 0],
  uptime: () => 0,
  userInfo: () => ({
    uid: 0,
    gid: 0,
    username: 'user',
    homedir: '/',
    shell: null,
  }),
};

