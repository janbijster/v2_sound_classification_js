<template>
  <div class="models">
    <div class="view-title h4">Models</div>
    <div class="vertical-split-holder">
      <vertical-split :fraction="0.4">
        <template v-slot:top>
          <div class="model-list text-left box h-100">
            <item-list
              :items="models"
              :selected-item="selectedModel"
              @select="selectModel"
              @delete="deleteModel"
            />
            <div class="models-bottom-btns">
              <div class="btn btn-sm" @click="newModel">New model</div>
            </div>
          </div>
        </template>
        <template v-slot:bottom>
          <div class="model-inspector box h-100">
            <template v-if="selectedModel">
              <div class="model-property">
                <span class="model-property-label">Name</span>
                {{ selectedModel.name }}
              </div>
              <div class="model-property">
                <span class="model-property-label">Created</span>
                {{ selectedModel.created }}
              </div>
              <select-multiple
                label="Labels"
                :items="labelObjects"
                :adjustable="!modelIsCreated"
                :selected="selectedModel.labels"
                class="select-labels"
                @change="selectLabels"
              />
              <div v-if="canCreateModel" class="btn" @click="createTfModel">
                Create model
              </div>
              <div v-if="modelIsCreated" class="model-info">Model created</div>
            </template>
          </div>
        </template>
      </vertical-split>
    </div>
  </div>
</template>

<script>
import VerticalSplit from '@/components/VerticalSplit'
import ItemList from '@/components/ItemList'
import SelectMultiple from '@/components/SelectMultiple'
import trainingUtils from '@/utils/trainingUtils'

const nullLabelObject = { name: 'unlabeled', value: null }

export default {
  name: 'Models',
  components: {
    VerticalSplit,
    ItemList,
    SelectMultiple
  },
  data() {
    return {
      selectedLabels: []
    }
  },
  computed: {
    modelIsCreated() {
      return this.selectedModel.hasTfModel
    },
    canCreateModel() {
      return (
        this.selectedModel &&
        !this.modelIsCreated &&
        this.selectedLabels.length > 1
      )
    },
    models() {
      return this.$store.getters['models/getModels']
    },
    selectedModel() {
      return this.$store.getters['models/getSelectedModel']
    },
    labelObjects() {
      return [
        nullLabelObject,
        ...this.labelsToObjects(this.$store.getters['sounds/getLabels'])
      ]
    }
  },
  methods: {
    labelsToObjects(labels) {
      return labels.map(label => ({
        name: label,
        value: label
      }))
    },
    objectsToLabels(objects) {
      return objects.map(obj => obj.value)
    },
    newModel() {
      const modelPrompt = window.prompt('New model name:')
      if (modelPrompt != null) {
        this.$store.commit('models/addModel', { name: modelPrompt })
      }
    },
    createTfModel() {
      if (!this.selectedModel) return
      if (!this.canCreateModel) return
      const tfModel = trainingUtils.getModel(this.selectedLabels.length)
      tfModel.summary()
      this.$store
        .dispatch('models/saveTfModel', {
          model: this.selectedModel,
          tfModel
        })
        .then(() => {
          this.$set(this.selectedModel, 'hasTfModel', true)
          this.$set(this.selectedModel, 'labels', this.selectedLabels)
          this.$store.dispatch('models/saveModels')
        })
    },
    selectModel(model) {
      this.$store.commit('models/selectModel', model)
    },
    deleteModel(model) {
      this.$store.commit('models/deleteModel', model)
    },
    selectLabels(labels) {
      this.selectedLabels = labels
    }
  }
}
</script>

<style scoped>
.models {
  padding-bottom: 1rem;
}
.models .box {
  margin: 0;
}
.vertical-split-holder {
  margin-top: 1rem;
  height: calc(100% - 3rem);
}
.model-list {
  position: relative;
}
.models-bottom-btns {
  position: absolute;
  bottom: 0.5rem;
}
.model-property {
  margin-bottom: 0.25rem;
}
.model-property-label {
  opacity: 0.5;
}
.select-labels {
  margin-bottom: 0.5rem;
}
</style>
