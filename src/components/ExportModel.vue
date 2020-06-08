<template>
  <div class="export-model">
    <div class="model-property model-property-name b">
      {{ model.name }}
    </div>
    <div v-if="model.trained" class="model-property model-property-stats">
      {{ model.epochsTrained }} epochs trained, acc:
      {{ roundTo(model.acc, 4) }}, loss:
      {{ roundTo(model.loss, 4) }}
    </div>
    <div class="btn" @click="exportModel">
      export model
    </div>
  </div>
</template>

<script>
import { saveAs } from 'file-saver'
import roundTo from 'round-to'
import * as tf from '@tensorflow/tfjs'

export default {
  props: {
    model: {
      type: Object,
      default: null
    }
  },
  methods: {
    async exportModel() {
      // get tfmodel
      const tfModel = await this.$store.dispatch('models/loadTfModel', {
        model: this.model
      })
      // serialize model
      let tfModelSerialized = await tfModel.save(
        tf.io.withSaveHandler(async modelArtifacts => modelArtifacts)
      )
      tfModelSerialized.weightData = Buffer.from(
        tfModelSerialized.weightData
      ).toString('base64')
      const tfModelJson = JSON.stringify(tfModelSerialized)
      // add tfModel to model metadata
      this.model.tfModelJson = tfModelJson
      // download
      saveAs(new Blob([JSON.stringify(this.model)]), `${this.model.name}.blob`)
    },
    roundTo
  }
}
</script>

<style lang="scss">
@import '@/assets/style/variables.scss';

.export-model {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: $blue-almost-white;
  border-radius: 3px;
}
.model-property {
  margin-bottom: 0.5rem;
}
</style>
