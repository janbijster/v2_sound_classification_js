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
        <template v-if="selectedSoundData">
          <div class="sound-property-label">
            play
          </div>
          <vue-audio class="sound-player" :file="selectedSoundData" />
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
      </div>
    </div>
  </div>
</template>

<script>
import VueAudio from '@/components/VueAudio/VueAudio'

export default {
  components: {
    VueAudio
  },
  data() {
    return {
      selectedSoundData: null
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
        this.$store
          .dispatch('sounds/loadSoundFile', sound)
          .then(file => (this.selectedSoundData = file))
          .catch(err => {
            console.log(err)
            this.selectedSoundData = null
          })
      }
    }
  },
  methods: {
    saveSounds() {
      this.$store.dispatch('sounds/saveSounds')
    }
  }
}
</script>

<style lang="scss" scoped>
$splitLeft: 33%;
$splitRight: 67%;

.sound-inspector,
.sound-inspector-content {
  text-align: left;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
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
