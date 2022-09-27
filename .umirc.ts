import { defineConfig } from 'umi';
import routes from './src/config/routes';
const TerserPlugin = require('terser-webpack-plugin');

export default defineConfig({
  title: 'Favor Explore',
  links: [{ rel: 'icon', href: './logo.ico' }],
  nodeModulesTransform: {
    type: 'none',
  },
  dynamicImport: {},
  routes,
  history: {
    type: 'hash',
  },
  fastRefresh: {},
  dva: {
    immer: true,
    hmr: false,
  },
  targets: {
    ie: 11,
  },
  hash: true,
  ignoreMomentLocale: true,
  webpack5: {},
  publicPath: './',
  theme: {
    'primary-color': '#1FD5AE',
    'text-color': '#fff',
    '@main_color': '#1FD5AE',
  },
  define: {
    BUILD_ENV: process.env.BUILD_ENV,
  },
  // mfsu:{}
  chainWebpack: (config, { webpack, env }) => {
    config.module
      .rule('fonts')
      .test(/\.(eot|woff|woff2|ttf)(\?.*)?$/)
      .use('file-loader')
      .options({
        name: '[name].[contenthash].[ext]',
        outputPath: 'static/fonts',
      })
      .loader(require.resolve('@umijs/deps/compiled/file-loader'));
    if (env === 'production') {
      config.plugin('TerserPlugin').use(TerserPlugin, [
        {
          parallel: true,
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log'],
            },
          },
        },
      ]);
    }
  },
  manifest: {},
});
