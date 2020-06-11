<template>
  <div class="sound-inspector">
    <div v-if="selectedSound != null" class="sound-inspector-content">
      <div class="sound-inspector-part left">
        <div class="sound-property sound-label">
          <div class="sound-property-label">label</div>
          <select
            v-model="selectedSound.label"
            class="wide"
            @change="saveSounds"
          >
            <option :value="null">unlabeled</option>
            <option
              v-for="(label, index) in labels"
              :key="index"
              :value="label"
              >{{ label }}</option
            >
          </select>
        </div>
        <div class="sound-property sound-name">
          <div class="sound-property-label">name</div>
          <input
            v-model="selectedSound.name"
            class="wide"
            @change="saveSounds"
          />
        </div>
      </div>
      <div class="sound-inspector-part right">
        <template v-if="noSoundFile">
          <div class="sound-property-label sound-player-msg">
            no sound file
          </div>
        </template>
        <template v-else-if="selectedSoundData">
          <div class="sound-property-label">
            play
          </div>
          <template v-if="useCustomAudioPlayer">
            <vue-audio class="sound-player" :file="selectedSoundData" />
          </template>
          <template v-else>
            <audio controls :src="selectedSoundData"></audio>
          </template>
        </template>
        <template v-else>
          <div class="sound-property-label sound-player-msg">
            loading sound...
          </div>
        </template>
        <div class="sound-property sound-datetime">
          <span class="sound-property-label">added </span>
          <span>{{ selectedSound.datetime }}</span>
        </div>
        <div class="sound-property sound-type">
          <span class="sound-property-label">type: </span>
          <span>{{ selectedSound.type }}</span>
        </div>
        <div class="sound-property sound-preprocessed">
          <template v-if="selectedSound.spectrograms">
            <span class="sound-property-label"
              >{{ selectedSound.spectrograms.length }} spectrograms
            </span>
            <div class="spectrograms-holder">
              <img
                v-for="(spectrogram, index) in selectedSound.spectrograms"
                :key="index"
                :src="spectrogramImage(spectrogram)"
              />
            </div>
          </template>
          <template v-else>
            <span class="sound-property-label">Not preprocessed </span>
            <div class="btn btn-sm" @click="$router.push(`/preprocess`)">
              preprocess
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueAudio from '@/components/VueAudio/VueAudio'
import imageUtils from '@/utils/imageUtils'

export default {
  components: {
    VueAudio
  },
  data() {
    return {
      selectedSoundData: null,
      noSoundFile: false,
      useCustomAudioPlayer: false
    }
  },
  computed: {
    selectedSound() {
      return this.$store.getters['sounds/getSelectedSound']
    },
    labels() {
      return this.$store.getters['sounds/getLabels']
    }
  },
  watch: {
    selectedSound(sound) {
      this.selectedSoundData = null
      if (sound != null) {
        if (sound.noSoundFile) {
          this.noSoundFile = true
        } else {
          this.$store
            .dispatch('sounds/loadSoundFile', sound)
            .then(file => (this.selectedSoundData = file))
            .catch(err => {
              console.log(err)
              this.selectedSoundData = null
            })
        }
      }
    }
  },
  methods: {
    saveSounds() {
      this.$store.dispatch('sounds/saveSounds')
    },
    spectrogramImage(spectrogram) {
      return imageUtils.createImageFromSpectrogram(spectrogram)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';
$splitLeft: 33%;
$splitRight: 67%;

.sound-inspector {
  height: 100%;
}
.sound-inspector-content {
  height: 100%;
}
.sound-inspector,
.sound-inspector-content {
  text-align: left;
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: $blue-almost-white;
  padding: 0.5rem;
  border-radius: 3px;
}
.sound-inspector-part {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}
.sound-inspector-part.left {
  width: calc(#{$splitLeft} - 0.5rem);
  left: 0;
}
.sound-inspector-part.right {
  width: calc(#{$splitRight} - 0.5rem);
  left: calc(#{$splitLeft} + 0.5rem);
}
.sound-property {
  margin-bottom: 0.25rem;
}
.sound-property-label {
  opacity: 0.5;
}
</style>
