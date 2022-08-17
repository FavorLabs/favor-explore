const route = [
  {
    path: '/video/:path',
    component: '@/pages/video/',
  },
  {
    path: '/',
    component: '@/layout',
    routes: [
      {
        path: '/',
        component: '@/pages/home',
        name: 'info',
      },
      {
        path: '/info',
        component: '@/pages/info',
        name: 'info',
      },
      {
        path: '/peers',
        component: '@/pages/peers',
        name: 'peers',
      },
      {
        path: '/files',
        component: '@/pages/files',
        name: 'files',
      },
      {
        path: 'account',
        component: '@/pages/accounting',
        name: 'accounting',
      },
      {
        path: '/setting',
        component: '@/pages/setting',
        name: 'setting',
      },
      {
        path: '/log',
        component: '@/pages/log',
        name: 'log',
      },
      {
        path: '/*',
        component: '@/pages/404',
        name: '404',
      },
    ],
  },
];

export default route;
