import { defineConfig } from 'umi';
import routes from './src/config/routes';

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
  chainWebpack: (config) => {
    config.module
      .rule('fonts')
      .test(/\.(eot|woff|woff2|ttf)(\?.*)?$/)
      .use('file-loader')
      .loader(require.resolve('@umijs/deps/compiled/file-loader'));
  },
  manifest: {},
});
