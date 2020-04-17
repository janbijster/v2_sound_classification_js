import Vue from 'vue'
import localforage from 'localforage'

localforage.setDriver('asyncStorage') // force indexedDB

export default {
  diskActivity: [],
  saveToDisk(key, value) {
    Vue.set(this.diskActivity, 0, `saving ${key}...`)
    console.log(this.diskActivity)
    localforage
      .setItem(key, value)
      .then(() => Vue.set(this.diskActivity, 0, null))
  },
  removeFromDisk(key) {
    Vue.set(this.diskActivity, 0, `removing ${key}...`)
    localforage
      .removeItem(key)
      .then(() => Vue.set(this.diskActivity, 0, null))
      .catch(e => console.log(e))
  },
  loadFromDisk(key) {
    return new Promise((resolve, reject) => {
      Vue.set(this.diskActivity, 0, `loading ${key}...`)
      localforage
        .getItem(key)
        .then(value => {
          Vue.set(this.diskActivity, 0, null)
          resolve(value)
        })
        .catch(err => {
          Vue.set(this.diskActivity, 0, null)
          reject(err)
        })
    })
  },
  clearDisk() {
    return new Promise(resolve => {
      if (
        window.confirm(
          'Are you sure you want to delete all sounds, labels and models?'
        )
      ) {
        Vue.set(this.diskActivity, 0, 'clearing disk...')
        localforage.clear().then(() => {
          Vue.set(this.diskActivity, 0, null)
          resolve()
        })
      }
    })
  }
}
