<template>
  <div class="models">
    <top-tabs />
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
                :label="
                  modelIsCreated
                    ? 'Model created with labels'
                    : 'Select at least 2 labels'
                "
                :items="
                  modelIsCreated
                    ? labelsToObjects(selectedModel.labels)
                    : labelObjects
                "
                :adjustable="!modelIsCreated"
                :selected="selectedModel.labels"
                class="select-labels"
                @change="selectLabels"
              />
              <div />
              <template v-if="canCreateModel">
                <div class="btn mar-bottom-sm" @click="createTfModel">
                  Create model
                </div>
                <div
                  class="btn mar-bottom-sm"
                  @click="deleteModel(selectedModel)"
                >
                  delete
                </div>
              </template>
              <div v-else-if="modelIsCreated" class="model-info">
                <div class="msg">Model created.</div>
                <template v-if="selectedModelHasUnprocessedSounds">
                  <div class="msg">
                    Warning: labels contain unprocessed sounds.
                  </div>
                  <div class="btn" @click="$router.push('preprocess')">
                    preprocess
                  </div>
                  <div class="msg" />
                </template>
                <div v-if="selectedModel.trained" class="msg">
                  {{ selectedModel.epochsTrained }} epochs trained, acc:
                  {{ selectedModel.acc }}, loss: {{ selectedModel.loss }}
                </div>
                <div class="btn mar-bottom-sm" @click="showTrainPopup = true">
                  train
                </div>
                <train-model
                  v-if="showTrainPopup && modelIsCreated"
                  :model="selectedModel"
                  @close="showTrainPopup = false"
                />
                <div
                  v-if="selectedModel.trained"
                  class="btn mar-bottom-sm"
                  @click="showEvaluatePopup = true"
                >
                  evaluate
                </div>
                <evaluate-model
                  v-if="
                    showEvaluatePopup && selectedModel && selectedModel.trained
                  "
                  :model="selectedModel"
                  @close="showEvaluatePopup = false"
                />
                <div
                  v-if="selectedModel.trained"
                  class="btn mar-bottom-sm"
                  @click="showPredictPopup = true"
                >
                  predict
                </div>
                <predict-model
                  v-if="
                    showPredictPopup && selectedModel && selectedModel.trained
                  "
                  :model="selectedModel"
                  @close="showPredictPopup = false"
                />
                <div
                  class="btn mar-bottom-sm"
                  @click="deleteModel(selectedModel)"
                >
                  delete
                </div>
              </div>
              <div
                v-else
                class="btn mar-bottom-sm"
                @click="deleteModel(selectedModel)"
              >
                delete
              </div>
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
import TrainModel from '@/components/TrainModel'
import EvaluateModel from '@/components/EvaluateModel'
import PredictModel from '@/components/PredictModel'
import trainingUtils from '@/utils/trainingUtils'
import TopTabs from '@/components/TopTabs.vue'

const nullLabelObject = { name: 'unlabeled', value: null }

export default {
  name: 'Models',
  components: {
    VerticalSplit,
    ItemList,
    SelectMultiple,
    TrainModel,
    EvaluateModel,
    PredictModel,
    TopTabs
  },
  data() {
    return {
      selectedLabels: [],
      showTrainPopup: false,
      showEvaluatePopup: false,
      showPredictPopup: false
    }
  },
  computed: {
    modelIsCreated() {
      return this.selectedModel && this.selectedModel.hasTfModel
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
    },
    selectedModelHasUnprocessedSounds() {
      if (!this.modelIsCreated && !this.canCreateModel) {
        return false
      }
      let hasUnprocessedSounds = false
      this.selectedModel.labels.forEach(label => {
        this.$store.getters['sounds/getSoundsByLabel'](label).forEach(sound => {
          if (!sound.spectrograms || sound.spectrograms.length == 0) {
            hasUnprocessedSounds = true
          }
        })
      })
      return hasUnprocessedSounds
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
      this.$store.dispatch('models/deleteModel', model)
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
  overflow-y: scroll;
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
  display: inline-block;
}
</style>
