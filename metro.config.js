const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase JS SDK ve diğer ESM paketlerini doğru çözmek için
config.resolver.unstable_enablePackageExports = true;

// Firebase'in browser-only modüllerini görmezden gel
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Firebase browser specific modülleri React Native'de hata verir
  if (
    moduleName === '@firebase/auth' ||
    moduleName === 'firebase/auth'
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
