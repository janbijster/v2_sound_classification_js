<template>
  <div class="sound-inspector">
    <div v-if="selectedSound != null" class="sound-inspector-content">
      <div class="sound-inspector-part left">
        <div class="sound-label">{{ selectedSound.label || 'unlabeled' }}</div>
        <div class="sound-name">{{ selectedSound.name }}</div>
        <div class="sound-datetime">{{ selectedSound.datetime }}</div>
        <div class="sound-type">{{ selectedSound.type }}</div>
      </div>
      <div class="sound-inspector-part right">
        <template v-if="selectedSoundData">
          <vue-audio class="sound-player" :file="selectedSoundData" />
        </template>
        <template v-else>
          <div class="sound-player-msg">loading sound...</div>
        </template>
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
    }
  },
  watch: {
    selectedSound(sound) {
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
  }
}
</script>

<style scoped>
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
  width: 50%;
  left: 0;
  top: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}
.sound-inspector-part.left {
  width: calc(50% - 0.5rem);
  left: 0;
}
.sound-inspector-part.right {
  width: calc(50% - 0.5rem);
  left: calc(50% + 0.5rem);
}
</style>
