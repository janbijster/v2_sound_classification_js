import Vue from 'vue'
import Vuex from 'vuex'
import sounds from './store-sounds.js'
import models from './store-models.js'
import DiskIO from '@/utils/DiskIO'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    loadAll({ dispatch }) {
      dispatch('sounds/loadAll')
      dispatch('models/loadAll')
    },
    clearAll({ commit }) {
      DiskIO.clearDisk().then(() => {
        commit('sounds/reset')
        commit('models/reset')
      })
    }
  },
  modules: {
    sounds,
    models
  }
})
