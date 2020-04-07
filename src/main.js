import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueLocalForage from 'vue-localforage'
Vue.use(VueLocalForage)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
