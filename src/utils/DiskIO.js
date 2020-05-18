import Vue from 'vue'
import localforage from 'localforage'
import * as tf from '@tensorflow/tfjs'

localforage.ready().then(() => {
  if (localforage.driver() != localforage.INDEXEDDB) {
    alert(
      'Warning: IndexedDB is not available for local storage in this browser. Some components may not work.'
    )
  }
})

export default {
  diskActivity: [],
  hasIndexedDB: () => localforage.driver() == localforage.INDEXEDDB,
  storagePath() {
    return this.hasIndexedDB ? 'indexeddb://' : 'localstorage://'
  },
  saveToDisk(key, value) {
    return new Promise(resolve => {
      Vue.set(this.diskActivity, 0, `saving ${key}...`)
      console.log(this.diskActivity)
      localforage.setItem(key, value).then(() => {
        Vue.set(this.diskActivity, 0, null)
        resolve()
      })
    })
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
  saveTfModel(model, tfModel) {
    return new Promise(resolve => {
      Vue.set(this.diskActivity, 0, `saving model file for ${model.name}...`)
      tfModel
        .save(`${this.storagePath()}model-file-${model.identifier}`)
        .then(() => {
          Vue.set(this.diskActivity, 0, null)
          resolve()
        })
    })
  },
  loadTfModel(model) {
    return new Promise((resolve, reject) => {
      Vue.set(this.diskActivity, 0, `loading model file for ${model.name}...`)
      tf.loadLayersModel(`${this.storagePath()}model-file-${model.identifier}`)
        .then(model => {
          Vue.set(this.diskActivity, 0, null)
          resolve(model)
        })
        .catch(err => {
          Vue.set(this.diskActivity, 0, null)
          reject(err)
        })
    })
  },
  clearTfModel(model) {
    Vue.set(this.diskActivity, 0, `removing model file for ${model.name}...`)
    tf.io
      .removeModel(`${this.storagePath()}model-file-${model.identifier}`)
      .then(() => Vue.set(this.diskActivity, 0, null))
      .catch(err => {
        Vue.set(this.diskActivity, 0, null)
        console.log(err)
      })
  },
  clearAllTfModels() {
    tf.io.listModels().then(models => {
      Object.keys(models).forEach(modelPath => {
        // TODO make this asynchronous, wait for each remove to finish before the next
        tf.io.removeModel(modelPath)
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
        this.clearAllTfModels()
        localforage.clear().then(() => {
          Vue.set(this.diskActivity, 0, null)
          resolve()
        })
      }
    })
  }
}
