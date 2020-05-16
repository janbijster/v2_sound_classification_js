<template>
  <div class="import-export-view">
    <div class="view-title h4">Import / Export</div>
    <div class="box text-center">
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
  </div>
</template>

<script>
import { saveAs } from 'file-saver'
import UploadFileButton from '@/components/UploadFileButton'
import Terminal from '@/components/Terminal'

export default {
  components: {
    UploadFileButton,
    Terminal
  },
  data() {
    return {
      output: []
    }
  },
  computed: {},
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
        .then(sounds => {
          this.$store.dispatch('sounds/importSounds', {
            sounds,
            logFunction: s => this.output.push(s)
          })
        })
        .catch(e => this.output.push(e))
    },
    importData(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          let data = JSON.parse(e.target.result)
          resolve(data)
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

<style scoped>
.import-export-view .box {
  height: calc(100% - 3rem);
}
.btn,
.msg {
  margin: 0.5rem;
}
.import-export-output {
  margin: 1rem 0;
  height: calc(100% - 10rem);
}
</style>
