import { defineConfig } from 'umi';
import routes from './src/config/routes';

export default defineConfig({
  title: 'Favor Explore',
  links: [{ rel: 'icon', href: './logo.png' }],
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
    'primary-color': '#399067',
    'text-color': '#399067',
    'heading-color': '#399067',
    'link-color': '#399067',
    '@main_color': '#399067',
  },
  define: {
    BUILD_ENV: process.env.BUILD_ENV,
  },
});
