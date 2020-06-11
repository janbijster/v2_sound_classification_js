<template>
  <div class="preprocess-view">
    <top-tabs />
    <div class="box text-center">
      <div class="btn" @click="preprocessAll">preprocess all</div>
    </div>
    <template v-if="batchOutput && batchOutput.length > 0">
      <div class="preprocess-output-holder box">
        <terminal class="preprocess-output" :output="batchOutput" />
        <div class="btn" @click="stopPreprocessAll">stop</div>
      </div>
    </template>
    <template v-else>
      <preprocess-item class="preprocess-item" :sound="sound" />
    </template>
  </div>
</template>

<script>
import audioUtils from '@/utils/audioUtils'
import imageUtils from '@/utils/imageUtils'
import PreprocessItem from '@/components/PreprocessItem'
import Terminal from '@/components/Terminal'
import TopTabs from '@/components/TopTabs.vue'

export default {
  components: {
    PreprocessItem,
    Terminal,
    TopTabs
  },
  data() {
    return {
      batchOutput: [],
      preprocessAllStopped: false
    }
  },
  computed: {
    sound() {
      return this.$store.getters['sounds/getSelectedSound']
    }
  },
  methods: {
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    async preprocessAll() {
      this.preprocessAllStopped = false
      this.batchOutput = ['Preprocessing all unpreprocessed sounds...\n\n']
      const allSounds = this.$store.getters['sounds/getAllSounds']
      for (let i = 0; i < allSounds.length; i++) {
        let sound = allSounds[i]
        if (sound.spectrograms && sound.spectrograms.length > 0) {
          this.batchOutput.push(
            `(${i}/${allSounds.length}) ${sound.name} - already processed, ${sound.spectrograms.length} spectrograms.`
          )
          // short pause to allow the DOM to update. Otherwise everything wil just freeze
          await this.sleep(100)
        } else {
          const audioSource = await this.loadSound(sound)
          const spectrograms = await this.preprocessSound(audioSource, sound)
          this.batchOutput.push(
            `(${i}/${allSounds.length}) ${sound.name} - processed : got ${spectrograms.length} spectrograms.`
          )
          // short pause to allow the DOM to update. Otherwise everything wil just freeze
          await this.sleep(100)
        }
        if (this.preprocessAllStopped) {
          break
        }
      }
      allSounds.forEach((sound, i) => {})
    },
    loadSound(sound) {
      return new Promise((resolve, reject) => {
        // check if a sound is selected
        if (sound == null) {
          reject(new Error('no sound selected'))
        } else {
          this.$store
            .dispatch('sounds/loadSoundFile', sound)
            .then(audioSource => resolve(audioSource))
        }
      })
    },
    preprocessSound(audioSource, sound) {
      return new Promise((resolve, reject) => {
        if (!audioSource) {
          reject(new Error('no audioSource'))
        } else {
          this.$set(sound, 'spectrograms', null)
          audioUtils
            .dataURIToAudioBuffer(audioSource)
            .then(audioBuffer => {
              const completeSpectrogram = audioUtils.analyzeSpectrogram(
                audioBuffer
              )
              const spectrograms = imageUtils.padAndCut(completeSpectrogram)
              if (spectrograms.length == 0) {
                console.log(completeSpectrogram)
              }
              // save spectrograms on sound
              this.$set(sound, 'spectrograms', spectrograms)
              this.$store.dispatch('sounds/saveSounds')
              resolve(spectrograms)
            })
            .catch(err => reject(err))
        }
      })
    },
    stopPreprocessAll() {
      this.preprocessAllStopped = true
      this.batchOutput = []
    }
  }
}
</script>

<style>
.preprocess-item {
  height: calc(100% - 7rem);
}
.preprocess-output-holder {
  height: calc(100% - 7rem);
}
.preprocess-output {
  height: calc(100% - 3rem);
  margin-bottom: 0.5rem;
}
</style>
