import Vue from 'vue'
import VueRouter from 'vue-router'
import Sounds from '@/views/Sounds'
import Preprocess from '@/views/Preprocess'
import Models from '@/views/Models'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/sounds' },
  {
    path: '/sounds',
    name: 'Sounds',
    showInMenu: true,
    component: Sounds
  },
  {
    path: '/preprocess/',
    name: 'Preprocess',
    showInMenu: true,
    component: Preprocess
  },
  {
    path: '/models/',
    name: 'Models',
    showInMenu: true,
    component: Models
  },
  {
    path: '/about',
    name: 'About',
    showInMenu: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
