const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);


const defaultConfig = getDefaultConfig(__dirname);

// Modify the default resolver assetExts array to include 'tflite'
const assetExts = defaultConfig.resolver.assetExts;
assetExts.push('tflite');

// Define your custom configuration
const config = {
  resolver: {
    assetExts, // include the updated asset extensions array
  },
};

// Merge the default config with your custom config
module.exports = mergeConfig(defaultConfig, config);
