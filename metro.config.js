// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Only apply Storybook polyfills for native platforms (iOS/Android), not web
// Web already has Node.js polyfills or doesn't need them
// Create a dynamic resolver that checks platform at resolution time
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Don't apply polyfills for web platform
  if (platform === 'web') {
    // Use default resolution for web
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  }

  // For native platforms, check if this is a Node.js module that needs polyfilling
  const nodeModulesToPolyfill = ['tty', 'fs', 'path', 'stream', 'util', 'buffer', 'process', 'os'];
  if (nodeModulesToPolyfill.includes(moduleName)) {
    const polyfillPath = path.resolve(__dirname, `metro-polyfills/${moduleName}.js`);
    return {
      filePath: polyfillPath,
      type: 'sourceFile',
    };
  }

  // Use default resolution for other modules
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
