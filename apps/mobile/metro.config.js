// Metro config (Metro is the tool that packs the phone app's code together).
//
// Why this file exists: the website pins an older React, so the top-level
// node_modules folder holds React 19.2.3 and React Native 0.86.3, while the
// phone app (Expo SDK 58) needs React 19.3.0 and React Native 0.88.0, which
// live in apps/mobile/node_modules. If libraries picked the old copies, the app
// would hold two Reacts and crash with "Invalid hook call". Here we force every
// import of these packages to use the phone app's own copy.
// This can be deleted once the whole repo uses the same React version.

/* eslint-disable @typescript-eslint/no-require-imports, no-undef -- Metro reads this file as plain Node code */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const ownModules = path.resolve(__dirname, 'node_modules');
const singletons = ['react', 'react-native'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const name = singletons.find((s) => moduleName === s || moduleName.startsWith(`${s}/`));
  if (name) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(ownModules, 'x.js') },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
