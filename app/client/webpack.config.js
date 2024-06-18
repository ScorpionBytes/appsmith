const { merge } = require("webpack-merge");
const WorkboxPlugin = require("workbox-webpack-plugin");
const common = require("./webpack.common.config.js");

module.exports = merge(common, {
  devServer: {
    proxy: {
      webSocketURL: {
        hostname: "127.0.0.1",
        pathname: "/ws",
        port: 3000,
        protocol: "ws",
      },
    },
  },
  optimization: {
    minimize: false,
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      // This tells webpack to invalidate the cache when the config file changes
      config: [__filename],
    },
  },
  experiments: {
    // buildHttpCache: true,
    cacheUnaffected: true,
  },
  plugins: [
    new WorkboxPlugin.InjectManifest({
      swSrc: "./src/serviceWorker.js",
      mode: "development",
      swDest: "./pageService.js",
      exclude: [
        // Don’t cache source maps and PWA manifests.
        // (These are the default values of the `exclude` option: https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-WebpackPartial,
        // so we need to specify them explicitly if we’re extending this array.)
        /\.map$/,
        /^manifest.*\.js$/,
        // Don’t cache the root html file
        /index\.html/,
        // Don’t cache LICENSE.txt files emitted by CRA
        // when a chunk includes some license comments
        /LICENSE\.txt/,
        // Don’t cache static icons as there are hundreds of them, and caching them all
        // one by one (as the service worker does it) keeps the network busy for a long time
        // and delays the service worker installation
        /\/*\.svg$/,
        /\.(js|css|html|png|jpg|jpeg|gif)$/, // Exclude JS, CSS, HTML, and image files
      ],
    }),
  ],
});
