import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import localforage from 'localforage'

// Functions for saving to and loading from disk
let diskActivity = null
const saveToDisk = (key, value) => {
  diskActivity = `saving ${key}...`
  localforage.setItem(key, value).then(() => diskActivity = null)
}
const removeFromDisk = key => {
  diskActivity = `removing ${key}...`
  localforage.removeItem(key).then(() => diskActivity = null)
}
const loadFromDisk = key => {
  return new Promise((resolve, reject) => {
    diskActivity = `loading ${key}...`
    localforage.getItem(key)
      .then(value => {
        diskActivity = null
        resolve(value)
      })
      .catch(err => {
        diskActivity = null
        reject(err)
      })
  })
}
const clearDisk = () => {
  if (window.prompt('Are you sure you want to delete all sounds and labels?')) {
    diskActivity = 'clearing disk...'
    localforage.clear().then(() => {
      diskActivity = null
    })
  }
}

export default {
  namespaced: true,
  state: {
    labels: [],
    sounds: [],
    selectedSound: null
  },
  getters: {
    getLabels: state => state.labels,
    getAllSounds: state => state.sounds,
    getSoundsByLabel: state => label => state.sounds.filter(sound => sound.label == label),
    getSelectedSound: state => state.selectedSound,
    getDiskActivity: () => diskActivity
  },
  mutations: {
    addLabel (state, newLabel) {
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
    deleteLabel (state, label) {
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
    addSound (state, { label, file }) {
      const datetime = moment().format('YYYY-MM-DD hh:mm:ss')
      const identifier = uuidv4()
      state.sounds.push({
        label: label,
        datetime,
        identifier
      })
      saveToDisk(`sound-file-${identifier}`, file)
      saveToDisk('sounds', state.sounds)
    },
    deleteSound (state, sound) {
      if (window.confirm(`Delete this sound?`)) {
        state.sounds = state.sounds.filter(oldSound => oldSound != sound)
        saveToDisk('labels', state.labels)
        removeFromDisk(`sound-file-${sound.identifier}`)
      }
    },
    selectSound (state, sound) {
      state.selectedSound = sound
    },
    clearAll () {
      clearDisk()
    }
  },
  actions: {
    newLabel (context) {
      return new Promise((resolve) => {
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
    loadAll ({ state }) {
      loadFromDisk('labels').then(labels => {
        if (labels != null) {
          state.labels = labels
        }
        loadFromDisk('sounds').then(sounds => {
          if (sounds != null) {
            state.sounds = sounds
          }
        }).catch(err => console.log(err))
      }).catch(err => console.log(err))
    }
  }
}