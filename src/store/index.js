import Vue from 'vue'
import Vuex from 'vuex'
import sounds from './store-sounds.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    sounds
  }
})
