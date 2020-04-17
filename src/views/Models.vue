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
                @change="selectLabels"
              />
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

const nullLabelObject = { name: 'unlabeled', value: null }

export default {
  name: 'Models',
  components: {
    VerticalSplit,
    ItemList,
    SelectMultiple
  },
  computed: {
    models() {
      return this.$store.getters['models/getModels']
    },
    selectedModel() {
      return this.$store.getters['models/getSelectedModel']
    },
    labelObjects() {
      return [
        nullLabelObject,
        ...this.$store.getters['sounds/getLabels'].map(label => ({
          name: label,
          value: label
        }))
      ]
    }
  },
  methods: {
    newModel() {
      const modelPrompt = window.prompt('New model name:')
      if (modelPrompt != null) {
        this.$store.commit('models/addModel', { name: modelPrompt })
      }
    },
    selectModel(model) {
      this.$store.commit('models/selectModel', model)
    },
    deleteModel(model) {
      this.$store.commit('models/deleteModel', model)
    },
    selectLabels(labels) {
      console.log(labels)
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
</style>
