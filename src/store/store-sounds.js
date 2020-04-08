import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import localforage from 'localforage'
import Vue from 'vue'

// Functions for saving to and loading from disk
localforage.setDriver('asyncStorage') // force indexedDB
const diskActivity = []
const saveToDisk = (key, value) => {
  Vue.set(diskActivity, 0, `saving ${key}...`)
  console.log(diskActivity)
  localforage.setItem(key, value).then(() => Vue.set(diskActivity, 0, null))
}
const removeFromDisk = key => {
  Vue.set(diskActivity, 0, `removing ${key}...`)
  localforage
    .removeItem(key)
    .then(() => Vue.set(diskActivity, 0, null))
    .catch(e => console.log(e))
}
const loadFromDisk = key => {
  return new Promise((resolve, reject) => {
    Vue.set(diskActivity, 0, `loading ${key}...`)
    localforage
      .getItem(key)
      .then(value => {
        Vue.set(diskActivity, 0, null)
        resolve(value)
      })
      .catch(err => {
        Vue.set(diskActivity, 0, null)
        reject(err)
      })
  })
}
const clearDisk = () => {
  return new Promise(resolve => {
    if (
      window.confirm('Are you sure you want to delete all sounds and labels?')
    ) {
      Vue.set(diskActivity, 0, 'clearing disk...')
      localforage.clear().then(() => {
        Vue.set(diskActivity, 0, null)
        resolve()
      })
    }
  })
}

export default {
  namespaced: true,
  state: {
    labels: [],
    sounds: [],
    selectedSound: null,
    diskActivity: diskActivity
  },
  getters: {
    getLabels: state => state.labels,
    getAllSounds: state => state.sounds,
    getSoundsByLabel: state => label =>
      state.sounds.filter(sound => sound.label == label),
    getSelectedSound: state => state.selectedSound,
    getDiskActivity: state => state.diskActivity[0]
  },
  mutations: {
    addLabel(state, newLabel) {
      // for some reason .findIndex and .find don't work :/
      let found = false
      state.labels.forEach(label => {
        found = found || label == newLabel
      })
      if (found == false) {
        state.labels = [...state.labels, newLabel]
        saveToDisk('labels', state.labels)
      } else {
        alert('Label already exists.')
      }
    },
    deleteLabel(state, label) {
      if (window.confirm(`Delete label ${label}?`)) {
        state.labels = state.labels.filter(oldLabel => oldLabel != label)
        // remove label from sounds:
        state.sounds = state.sounds.map(sound => {
          if (sound.label == label) {
            sound.label = null
          }
          return sound
        })
        saveToDisk('labels', state.labels)
        saveToDisk('sounds', state.sounds)
      }
    },
    addSound(state, { name, type, label, file }) {
      const datetime = moment().format('YYYY-MM-DD HH:mm:ss')
      const identifier = uuidv4()
      state.sounds.push({
        label: label,
        name: name,
        type: type,
        datetime,
        identifier
      })
      saveToDisk(`sound-file-${identifier}`, file)
      saveToDisk('sounds', state.sounds)
    },
    deleteSound(state, sound) {
      if (window.confirm(`Delete this sound?`)) {
        state.sounds = state.sounds.filter(
          oldSound => oldSound.identifier != sound.identifier
        )
        state.selectedSound = null
        saveToDisk('sounds', state.sounds)
        removeFromDisk(`sound-file-${sound.identifier}`)
      }
    },
    selectSound(state, sound) {
      state.selectedSound = sound
    }
  },
  actions: {
    newLabel(context) {
      return new Promise(resolve => {
        const labelPrompt = window.prompt('New label name:')
        if (labelPrompt != null) {
          const newLabel = labelPrompt.toLowerCase().trim()
          context.commit('addLabel', newLabel)
          resolve(newLabel)
        } else {
          resolve(null)
        }
      })
    },
    loadAll({ state }) {
      console.log('loading sounds and labels...')
      loadFromDisk('labels')
        .then(labels => {
          if (labels != null) {
            state.labels = labels
          }
          loadFromDisk('sounds')
            .then(sounds => {
              if (sounds != null) {
                state.sounds = sounds
              }
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    },
    clearAll({ state }) {
      clearDisk().then(() => {
        state.labels = []
        state.sounds = []
        state.electedSound = null
      })
    },
    loadSoundFile(_, sound) {
      return new Promise((resolve, reject) => {
        loadFromDisk(`sound-file-${sound.identifier}`)
          .then(file => resolve(file))
          .catch(err => reject(err))
      })
    },
    saveSounds({ state }) {
      saveToDisk('sounds', state.sounds)
    }
  }
}
