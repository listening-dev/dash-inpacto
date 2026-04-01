const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Strip the "node:" URI prefix so webpack can resolve these modules
      // via the browser field fallbacks (needed for pptxgenjs browser compat)
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
      ];

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        https: false,
        os: false,
        path: false,
      };

      return webpackConfig;
    },
  },
};
