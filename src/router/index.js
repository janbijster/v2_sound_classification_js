import Vue from 'vue'
import VueRouter from 'vue-router'
import Sounds from '@/views/Sounds'
import Preprocess from '@/views/Preprocess'
import Models from '@/views/Models'
import About from '@/views/About'
import ImportExport from '@/views/ImportExport'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/about' },
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
    component: About
  },
  {
    path: '/import-export',
    name: 'Import/Export',
    showInMenu: true,
    component: ImportExport
  }
]

const router = new VueRouter({
  routes
})

export default router
