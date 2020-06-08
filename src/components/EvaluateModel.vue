<template>
  <div class="evaluate-model popup">
    <div class="evaluate-model-content">
      <div class="evaluate-model-title b">evaluate model {{ model.name }}</div>
      <div v-if="confusionMatrix" class="confusion-matrix-holder">
        <table class="confusion-matrix">
          <div class="msg">
            Confusion matrix (vertical axis: true labels, horizontal axis:
            predicted labels)
          </div>
          <tr>
            <th></th>
            <th
              v-for="(label, labelIndex) in model.labels"
              :key="labelIndex"
              class="b"
            >
              {{ label }}
            </th>
          </tr>
          <tr v-for="(row, rowIndex) in confusionMatrix" :key="rowIndex">
            <td class="b">{{ row[0].trueLabel }}</td>
            <td
              v-for="(col, colIndex) in row"
              :key="colIndex"
              :style="celStyle(col, row)"
            >
              {{ col.count }} ({{ percentage(col, row) }} %)
            </td>
          </tr>
        </table>
      </div>

      <terminal class="evaluate-model-output-holder" :output="output" />
      <div class="btn" @click="quit">quit</div>
    </div>
  </div>
</template>

<script>
import trainingUtils from '@/utils/trainingUtils'
import Terminal from '@/components/Terminal'

export default {
  components: {
    Terminal
  },
  props: {
    model: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      output: [],
      hasQuit: false,
      confusionMatrix: null
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
    modelSounds.forEach(({ label, sounds }) => {
      const labelSpectrograms = {
        label,
        spectrograms: []
      }
      sounds.forEach(sound => {
        if (sound.spectrograms && sound.spectrograms.length > 0) {
          numSpectrograms += sound.spectrograms.length
          labelSpectrograms.spectrograms.push(...sound.spectrograms)
        }
      })
      if (labelSpectrograms.spectrograms.length == 0) {
        emptyLabels.push(label)
      }
      spectrogramsByLabel.push(labelSpectrograms)
    })
    // Warn on empty labels
    if (emptyLabels.length > 0) {
      const emptyLabelNames = emptyLabels.join(', ')
      this.output.push(
        `Warning: labels (${emptyLabelNames}) contain no preprocessed sounds.`
      )
    }
    this.output.push(
      `Got ${numSpectrograms} spectrograms in ${spectrogramsByLabel.length} labels:`
    )
    spectrogramsByLabel.forEach(({ label, spectrograms }) =>
      this.output.push(`  ${label}: ${spectrograms.length}`)
    )
    const dataSet = trainingUtils.prepareData(spectrogramsByLabel)

    // load tensorflow model
    this.output.push('Loading tensorflow model...')
    this.$store
      .dispatch('models/loadTfModel', { model: this.model })
      .then(tfModel => {
        // compile
        tfModel = trainingUtils.compile(tfModel)
        this.output.push('Model ready:')
        this.output.push(...trainingUtils.getModelSummary(tfModel))
        // evaluate model
        this.evaluate(tfModel, dataSet, this.model.labels)
      })
      .catch(err => {
        this.output.push('Encountered an error, check the console.')
        console.log(err)
      })
  },
  methods: {
    async evaluate(tfModel, dataSet, labels) {
      this.confusionMatrix = await trainingUtils.evaluate(
        tfModel,
        dataSet,
        labels
      )
      console.log(this.confusionMatrix)
    },
    percentage(col, row) {
      return Math.round((col.count / this.rowTotal(row)) * 100)
    },
    rowTotal(row) {
      return row.reduce((total, col) => total + col.count, 0)
    },
    celStyle(col, row) {
      const frac = this.percentage(col, row) / 100
      return {
        backgroundColor: `rgba(94, 97, 135, ${frac})`,
        color: frac > 0.5 ? '#fff' : '#000'
      }
    },
    quit() {
      this.hasQuit = true
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/style/variables.scss';

.evaluate-model-content {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  text-align: center;
}
.evaluate-model-title {
  margin-bottom: 0.5rem;
}
.evaluate-model-msg {
  margin-bottom: 0.5rem;
}
.evaluate-model-output-holder {
  height: 15rem;
  margin-bottom: 0.5rem;
}
table.confusion-matrix {
  font-size: 0.75rem;
  display: inline-block;
  margin: 1rem;
}
</style>
