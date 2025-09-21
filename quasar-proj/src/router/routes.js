const routes = [
  {
    path: '/',
    component: () => import('pages/LandingPage.vue'),
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'users', component: () => import('pages/UsersPage.vue') },
      { path: 'add-user', component: () => import('pages/AddUserPage.vue') },
      { path: 'identity', component: () => import('pages/ManagementIdentities.vue') }, 
      { path: 'context', component: () => import('pages/ManagementContexts.vue') }, 
      { path: 'search', component: () => import('src/pages/SearchPage.vue') }, 
      { path: 'settings', component: () => import('src/pages/AccountSettings.vue') }, 
    ],
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/auth/callback',
    component: () => import('pages/AuthCallback.vue'),
  },
]

export default routes
