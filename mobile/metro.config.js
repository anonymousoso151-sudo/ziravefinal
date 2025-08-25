const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions if needed
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Configure for React Native Vector Icons
config.resolver.alias = {
  ...config.resolver.alias,
};

module.exports = config;