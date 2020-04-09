<template>
  <div class="preprocess-item box h-100">
    <div class="btn btn-sm back-btn " @click="$router.back()">back</div>
    <template v-if="!sound">
      Select a sound in the
      <router-link to="/sounds">sounds</router-link> window to preprocess
    </template>
    <template v-else>
      <template v-if="!audioSource">
        loading sound...
      </template>
      <template v-else>
        <div class="audio-preview">
          <div clas="preprocess-item-sound-name">
            {{ sound.name }}
          </div>
          <div clas="preprocess-item-sound-datetime">
            {{ sound.datetime }}
          </div>
          <audio ref="audio" controls preload="auto" :src="audioSource"></audio>
        </div>
        <!-- spectrograms: -->
        <template v-if="!spectrograms || spectrograms.length == 0">
          <div class="btn" @click="preprocessSound">preprocess</div>
        </template>
        <template v-else>
          <div class="spectrogram-holder">
            <img
              v-for="(spectrogram, index) in spectrograms"
              :key="index"
              :src="spectrogramImage(spectrogram)"
            />
          </div>
        </template>
        <!-- end spectrograms -->
      </template>
    </template>
  </div>
</template>

<script>
import audioUtils from '@/utils/audioUtils'
import imageUtils from '@/utils/imageUtils'

export default {
  props: {
    sound: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      audioSource: null,
      spectrograms: []
    }
  },
  watch: {
    sound(newSound, oldSound) {
      if (newSound != oldSound) this.loadSound()
    }
  },
  mounted() {
    this.loadSound()
  },
  methods: {
    loadSound() {
      // check if a sound is selected
      if (this.sound == null) return
      this.$store
        .dispatch('sounds/loadSoundFile', this.sound)
        .then(audioSource => (this.audioSource = audioSource))
    },
    preprocessSound() {
      if (!this.audioSource) return
      audioUtils.dataURIToAudioBuffer(this.audioSource).then(audioBuffer => {
        console.log(audioBuffer)
        const completeSpectrogram = audioUtils.analyzeMfcc(audioBuffer)
        const spectrograms = imageUtils.padAndCut(completeSpectrogram)
        console.log(completeSpectrogram.length, spectrograms.length)
        this.spectrograms = spectrograms
      })
    },
    spectrogramImage(spectrogram) {
      return imageUtils.createImageFromSpectrogram(spectrogram)
    }
  }
}
</script>

<style lang="scss" scoped>
.preprocess-item {
  position: relative;
}
.back-btn {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  margin: 0;
}
</style>
