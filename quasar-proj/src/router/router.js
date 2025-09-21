import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/users', component: () => import('pages/UsersPage.vue') },
      {
        path: '/add-user',
        component: () => import('pages/AddUserPage.vue'),
      },
    ],
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue')
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
