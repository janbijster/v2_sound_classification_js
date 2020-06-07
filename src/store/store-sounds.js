import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import DiskIO from '@/utils/DiskIO'

export default {
  namespaced: true,
  state: {
    labels: [],
    sounds: [],
    selectedSound: null,
    diskActivity: DiskIO.diskActivity
  },
  getters: {
    getLabels: state => state.labels,
    getAllSounds: state => state.sounds,
    getSoundsByLabel: state => label =>
      state.sounds.filter(sound => sound.label == label),
    getSoundByIdentifier: state => identifier =>
      state.sounds.find(sound => sound.identifier == identifier),
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
        DiskIO.saveToDisk('labels', state.labels)
      } else {
        console.log('Label already exists.')
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
        DiskIO.saveToDisk('labels', state.labels).then(() =>
          DiskIO.saveToDisk('sounds', state.sounds)
        )
      }
    },
    addSound(state, { name, type, label, file }) {
      const datetime = moment().format('YYYY-MM-DD HH:mm:ss')
      const identifier = uuidv4()
      const newSound = {
        label: label,
        name: name,
        type: type,
        datetime,
        identifier
      }
      state.sounds.push(newSound)
      state.selectedSound = newSound
      DiskIO.saveToDisk(`sound-file-${identifier}`, file).then(() =>
        DiskIO.saveToDisk('sounds', state.sounds)
      )
    },
    deleteSound(state, sound) {
      if (window.confirm(`Delete this sound?`)) {
        state.selectedSound = null
        state.sounds = state.sounds.filter(
          oldSound => oldSound.identifier != sound.identifier
        )
        DiskIO.saveToDisk('sounds', state.sounds).then(() =>
          DiskIO.removeFromDisk(`sound-file-${sound.identifier}`)
        )
      }
    },
    selectSound(state, sound) {
      state.selectedSound = sound
    },
    reset(state) {
      state.labels = []
      state.sounds = []
      state.selectedSound = null
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
    importSounds(
      { state, commit },
      { sounds, logFunction = s => console.log(s) }
    ) {
      sounds.forEach(sound => {
        let found = false
        state.sounds.forEach(checkSound => {
          found = found || checkSound.identifier == sound.identifier
        })
        if (found) {
          logFunction(`Sound ${sound.name} already in store`)
        } else {
          logFunction(`Adding sound ${sound.name}...`)
          // add a property on the sound indicating that the sound
          // was imported and has no sound file
          sound.noSoundFile = true
          state.sounds.push(sound)
          // add label in case it doesn't exist
          commit('addLabel', sound.label)
        }
      })
      DiskIO.saveToDisk('sounds', state.sounds)
    },
    loadAll({ state }) {
      console.log('loading sounds and labels...')
      DiskIO.loadFromDisk('labels')
        .then(labels => {
          if (labels != null) {
            state.labels = labels
          }
          DiskIO.loadFromDisk('sounds')
            .then(sounds => {
              if (sounds != null) {
                state.sounds = sounds
              }
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    },
    loadSoundFile(_, sound) {
      return new Promise((resolve, reject) => {
        DiskIO.loadFromDisk(`sound-file-${sound.identifier}`)
          .then(file => resolve(file))
          .catch(err => reject(err))
      })
    },
    saveSounds({ state }) {
      DiskIO.saveToDisk('sounds', state.sounds)
    }
  }
}
