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
    // 'primary-color': 'linear-gradient(180deg, #1FD5AE 0%, #0E8E73 100%)',
    'primary-color': '#1FD5AE',
    'text-color': '#fff',
    // 'heading-color': '#399067',
    // 'link-color': '#399067',
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
});
