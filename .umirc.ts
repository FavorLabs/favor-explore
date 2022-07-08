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
    'primary-color': '#1fd5ae',
    'text-color': '#1fd5ae',
    'heading-color': '#1fd5ae',
    'link-color': '#1fd5ae',
    '@main_color': '#1fd5ae',
  },
  define: {
    BUILD_ENV: process.env.BUILD_ENV,
  },
  mfsu: {},
});
