<template>
  <div class="train-model popup">
    <div class="train-model-content">
      <div class="train-model-title b">train model {{ model.name }}</div>
      <div ref="output" class="train-model-output-holder">
        <div
          v-for="(msg, index) in output"
          :key="index"
          class="train-model-output-msg mono"
        >
          {{ msg }}
        </div>
        <div class="train-model-output-end" />
      </div>
      <div class="btn" @click="quit">quit</div>
    </div>
  </div>
</template>

<script>
import trainingUtils from '@/utils/trainingUtils'

export default {
  props: {
    model: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      output: [],
      hasQuit: false
    }
  },
  computed: {},
  watch: {
    output() {
      const outputHolderEl = this.$refs['output']
      outputHolderEl.scrollTop = outputHolderEl.scrollHeight
    }
  },
  mounted() {
    if (!this.model || !this.model.hasTfModel) {
      this.output.push('No tensorflow model.')
      return
    }
    // get data
    this.output.push('Loading data...')
    // get sounds organized by label
    const modelSounds = this.model.labels.map(label => ({
      label,
      sounds: this.$store.getters['sounds/getSoundsByLabel'](label)
    }))
    // collect spectrograms and do checks
    let numSpectrograms = 0
    let spectrogramsByLabel = []
    let emptyLabels = []
    let numUnprocessedSounds = 0
    modelSounds.forEach(({ label, sounds }) => {
      const labelSpectrograms = {
        label,
        spectrograms: []
      }
      sounds.forEach(sound => {
        if (sound.spectrograms && sound.spectrograms.length > 0) {
          numSpectrograms += sound.spectrograms.length
          labelSpectrograms.spectrograms.push(...sound.spectrograms)
        } else {
          numUnprocessedSounds += 1
        }
      })
      if (labelSpectrograms.spectrograms.length == 0) {
        emptyLabels.push(label)
      }
      spectrogramsByLabel.push(labelSpectrograms)
    })
    // prompt warning if there are unprocessed sounds
    if (numUnprocessedSounds > 0) {
      if (
        !window.confirm(
          `Warning: ${numUnprocessedSounds} sounds are not processed yet. Continue training?`
        )
      ) {
        this.output.push('Training aborted.')
        return
      }
    }
    // should have no empty labels
    if (emptyLabels.length > 0) {
      const emptyLabelNames = emptyLabels.join(', ')
      this.output.push(
        `Error: labels (${emptyLabelNames}) contain no preprocessed sounds.`
      )
      return
    }
    this.output.push(
      `Got ${numSpectrograms} spectrograms in ${spectrogramsByLabel.length} labels:`
    )
    spectrogramsByLabel.forEach(({ label, spectrograms }) =>
      this.output.push(`  ${label}: ${spectrograms.length}`)
    )
    const trainData = trainingUtils.prepareData(spectrogramsByLabel)

    // load tensorflow model
    this.output.push('Loading tensorflow model...')
    this.$store
      .dispatch('models/loadTfModel', { model: this.model })
      .then(tfModel => {
        // compile
        tfModel = trainingUtils.compile(tfModel)
        this.output.push('Model ready:')
        this.output.push(...trainingUtils.getModelSummary(tfModel))
        // train model
        this.trainEpochs(tfModel, trainData)
      })
      .catch(err => {
        this.output.push('Encountered an error, check the console.')
        console.log(err)
      })
  },
  methods: {
    async trainEpochs(tfModel, trainData) {
      this.output.push(
        'Start training. Model is saved after each iteration if the loss decreased, press quit to end training.'
      )
      let minLoss = 1
      for (let i = 0; i < 1000; i++) {
        if (this.hasQuit) break
        const history = await trainingUtils.train(tfModel, trainData)
        const loss = history.history.loss[0]
        const acc = history.history.acc[0]
        this.output.push(`loss: ${loss}, acc: ${acc}`)
        if (loss < minLoss) {
          this.output.push(`loss decreased, saving...`)
          this.model.trained = true
          this.model.epochsTrained = this.model.epochsTrained
            ? this.model.epochsTrained + 1
            : 1
          this.model.loss = loss
          this.model.acc = acc
          this.$store.dispatch('models/saveModels')
          await this.$store.dispatch('models/saveTfModel', {
            model: this.model,
            tfModel
          })
        }
        minLoss = Math.min(minLoss, loss)
      }
      this.output.push('Training done.')
    },
    quit() {
      // possibly interrupt training?
      this.hasQuit = true
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/style/variables.scss';

.train-model-content {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  text-align: center;
}
.train-model-title {
  margin-bottom: 0.5rem;
}
.train-model-msg {
  margin-bottom: 0.5rem;
}
.train-model-output-holder {
  text-align: left;
  height: calc(100% - 6rem);
  margin-bottom: 0.5rem;
  overflow-y: scroll;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.5rem;
}
.train-model-output-msg {
  margin-bottom: 0.25rem;
  color: $blue;
}
.train-model-output-end {
  height: 2rem;
}
</style>
