import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import DiskIO from '@/utils/DiskIO'

export default {
  namespaced: true,
  state: {
    models: [],
    selectedModel: null,
    diskActivity: DiskIO.diskActivity
  },
  getters: {
    getModels: state => state.models,
    getModelByIdentifier: state => identifier =>
      state.models.find(model => model.identifier == identifier),
    getSelectedModel: state => state.selectedModel,
    getDiskActivity: state => state.diskActivity[0]
  },
  mutations: {
    addModel(state, model) {
      const created = moment().format('YYYY-MM-DD HH:mm:ss')
      const identifier = uuidv4()
      const newModel = { created, identifier, ...model }
      state.models.push(newModel)
      state.selectedModel = newModel
      DiskIO.saveToDisk('models', state.models)
    },
    deleteModel(state, model) {
      if (window.confirm(`Delete model ${model.name}?`)) {
        state.models = state.models.filter(oldModel => oldModel != model)
        DiskIO.saveToDisk('models', state.models)
      }
    },
    selectModel(state, model) {
      state.selectedModel = model
    },
    reset(state) {
      state.models = []
      state.selectedModel = null
    }
  },
  actions: {
    loadAll({ state }) {
      console.log('loading models...')
      DiskIO.loadFromDisk('models')
        .then(models => {
          if (models != null) {
            state.models = models
          }
        })
        .catch(err => console.log(err))
    },
    saveModels({ state }) {
      DiskIO.saveToDisk('models', state.models)
    }
  }
}
