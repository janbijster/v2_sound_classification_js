<template>
  <div class="preprocess-view">
    <div class="view-title h4">Preprocess</div>
    <div class="box text-center">
      <div class="btn" @click="preprocessAll">preprocess all</div>
    </div>
    <template v-if="batchOutput && batchOutput.length > 0">
      <div class="preprocess-output box">
        <div
          v-for="(msg, index) in batchOutput"
          :key="index"
          class="preprocess-output-msg"
        >
          {{ msg }}
        </div>
      </div>
      <div class="btn" @click="batchOutput = []">close</div>
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

export default {
  components: {
    PreprocessItem
  },
  data() {
    return {
      batchOutput: []
    }
  },
  computed: {
    sound() {
      return this.$store.getters['sounds/getSelectedSound']
    }
  },
  methods: {
    preprocessAll() {
      this.batchOutput = ['Preprocessing all unpreprocessed sounds...\n\n']
      const allSounds = this.$store.getters['sounds/getAllSounds']
      allSounds.forEach((sound, i) => {
        if (sound.spectrograms && sound.spectrograms.length > 0) {
          this.batchOutput.push(
            `(${i}/${allSounds.length}) ${sound.name} - already processed, ${sound.spectrograms.length} spectrograms.`
          )
        } else {
          this.loadSound(sound).then(audioSource => {
            this.preprocessSound(audioSource, sound).then(spectrograms => {
              this.batchOutput.push(
                `(${i}/${allSounds.length}) ${sound.name} - processed : got ${spectrograms.length} spectrograms.`
              )
            })
          })
        }
      })
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
              const completeSpectrogram = audioUtils.analyzeMfcc(audioBuffer)
              const spectrograms = imageUtils.padAndCut(completeSpectrogram)
              // save spectrograms on sound
              this.$set(sound, 'spectrograms', spectrograms)
              this.$store.dispatch('sounds/saveSounds')
              resolve(spectrograms)
            })
            .catch(err => reject(err))
        }
      })
    }
  }
}
</script>

<style>
.preprocess-item {
  height: calc(100% - 7rem);
}
</style>
