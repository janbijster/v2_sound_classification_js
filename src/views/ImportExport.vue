<template>
  <div class="import-export-view">
    <div class="view-title h4">Import / Export</div>
    <div class="box split-left text-center">
      <h4>Sounds</h4>
      <div class="btn" @click="exportSounds">
        export processed sounds
      </div>
      <div class="msg">
        (only the sound metadata and processed spectrograms are exported)
      </div>
      <upload-file-button
        btn-text="upload processed sounds"
        btn-class="btn"
        :multiple="false"
        accept=".blob"
        @files="importSounds"
      />
      <terminal class="import-export-output" :output="output" />
    </div>
    <div class="box split-right text-center">
      <h4>Models</h4>
      <upload-file-button
        btn-text="import model"
        btn-class="btn"
        :multiple="false"
        accept=".blob"
        @files="importModel"
      />
      <div class="model-list">
        <export-model
          v-for="(model, index) in models"
          :key="index"
          :model="model"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { saveAs } from 'file-saver'
import UploadFileButton from '@/components/UploadFileButton'
import Terminal from '@/components/Terminal'
import ExportModel from '@/components/ExportModel'
import * as tf from '@tensorflow/tfjs'

export default {
  components: {
    UploadFileButton,
    Terminal,
    ExportModel
  },
  data() {
    return {
      output: []
    }
  },
  computed: {
    models() {
      return this.$store.getters['models/getModels']
    }
  },
  methods: {
    exportSounds() {
      const sounds = this.$store.getters['sounds/getAllSounds']
      this.saveData(sounds, 'sounds.blob')
    },
    saveData(data, name = 'data.blob') {
      saveAs(new Blob([JSON.stringify(data)]), name)
    },
    importSounds(files) {
      if (files.length == 0) {
        return
      }
      this.importData(files[0])
        .then(data => {
          let sounds = JSON.parse(data)
          this.$store.dispatch('sounds/importSounds', {
            sounds,
            logFunction: s => this.output.push(s)
          })
        })
        .catch(e => this.output.push(e))
    },
    async importModel(files) {
      if (files.length == 0) {
        return
      }
      const modelJson = await this.importData(files[0])

      try {
        const model = JSON.parse(modelJson)
        // get serialized tfModel from model
        const tfModelJson = model.tfModelJson
        // TODO clear the tfModelJson key to save storage
        // deserialize tfModel
        const tfModelSerialized = JSON.parse(tfModelJson)
        const weightData = new Uint8Array(
          Buffer.from(tfModelSerialized.weightData, 'base64')
        ).buffer
        const tfModel = await tf.loadLayersModel(
          tf.io.fromMemory(
            tfModelSerialized.modelTopology,
            tfModelSerialized.weightSpecs,
            weightData
          )
        )
        this.$store.dispatch('models/importModel', { model, tfModel })
      } catch {
        console.log('Error processign model')
      }
    },
    importData(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          resolve(e.target.result)
        }
        try {
          reader.readAsText(file)
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.import-export-view {
  position: relative;
  height: 100vh;
}

// split
// horizontal on wide screens:
.split-left,
.split-right {
  position: absolute;
  width: calc(50% - 1.5rem);
  height: calc(100% - 4.5rem);
}
.split-right {
  right: 1rem;
}
// vertical on narrow screens:
@media screen and (max-width: 800px) {
  .split-left,
  .split-right {
    position: absolute;
    height: calc(50% - 2.75rem);
    width: calc(100% - 2rem);
  }
  .split-right {
    bottom: 0;
  }
}

.btn,
.msg {
  margin-bottom: 0.5rem;
}
.import-export-output {
  margin: 1rem 0;
  height: calc(100% - 13rem);
  border-radius: 3px;
}
.model-list {
  text-align: center;
  overflow-y: scroll;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.5rem;
  margin: 1rem 0;
  height: calc(100% - 6rem);
  border-radius: 3px;
}
</style>
