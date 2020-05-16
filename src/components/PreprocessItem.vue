<template>
  <div class="preprocess-item box h-100">
    <div class="btn btn-sm back-btn " @click="$router.back()">back</div>
    <template v-if="!sound">
      Select a sound in the
      <router-link to="/sounds">sounds</router-link> window to preprocess
    </template>
    <template v-else>
      <template v-if="!audioSource && !noSoundFile">
        loading sound...
      </template>
      <template v-else>
        <div v-if="audioSource" class="audio-preview">
          <div clas="preprocess-item-sound-name">
            {{ sound.name }}
          </div>
          <div clas="preprocess-item-sound-datetime">
            {{ sound.datetime }}
          </div>
          <audio ref="audio" controls preload="auto" :src="audioSource"></audio>
        </div>
        <!-- spectrograms: -->
        <template
          v-if="
            !noSoundFile &&
              (!sound.spectrograms || sound.spectrograms.length == 0)
          "
        >
          <div class="btn" @click="preprocessSoundBtn">preprocess</div>
        </template>
        <template v-else>
          <div class="spectrograms-info">
            {{ sound.spectrograms.length }} spectrograms ({{
              sound.spectrograms.length * 4
            }}
            s)
          </div>
          <div class="spectrograms-holder">
            <img
              v-for="(spectrogram, index) in sound.spectrograms"
              :key="index"
              :src="spectrogramImage(spectrogram)"
            />
          </div>
          <div v-if="!noSoundFile" class="btn" @click="preprocessSoundBtn">
            preprocess again
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
      noSoundFile: false,
      spectrograms: []
    }
  },
  watch: {
    sound(newSound, oldSound) {
      if (newSound != oldSound) this.loadSound()
    }
  },
  mounted() {
    this.loadSound(this.sound)
      .then(audioSource => {
        this.audioSource = audioSource
      })
      .catch(e => console.log(e))
  },
  methods: {
    preprocessSoundBtn() {
      this.preprocessSound(this.audioSource, this.sound).catch(e => alert(e))
    },
    loadSound(sound) {
      return new Promise((resolve, reject) => {
        // check if a sound is selected
        if (sound == null) {
          reject(new Error('no sound selected'))
        } else {
          if (sound.noSoundFile) {
            this.noSoundFile = true
          } else {
            this.$store
              .dispatch('sounds/loadSoundFile', sound)
              .then(audioSource => resolve(audioSource))
          }
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
              let completeSpectrogram, spectrograms
              try {
                completeSpectrogram = audioUtils.analyzeMfcc(audioBuffer)
                spectrograms = imageUtils.padAndCut(completeSpectrogram)
              } catch (e) {
                alert(e)
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
.spectrograms-info {
  margin-bottom: 0.5rem;
}
.spectrograms-holder {
  width: 100%;
  height: 50%;
  overflow: scroll;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 3px;
  margin-bottom: 0.5rem;
}
.spectrograms-holder > img {
  margin: 0.25rem;
}
</style>
