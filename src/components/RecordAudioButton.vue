<template>
  <div class="record-audio-button">
    <div class="btn btn-sm" @click="displayRecorder = true">record</div>
    <audio-recorder
      v-if="displayRecorder"
      @close="displayRecorder = false"
      @sound="getSound"
    />
  </div>
</template>

<script>
import AudioRecorder from '@/components/AudioRecorder'

export default {
  components: {
    AudioRecorder
  },
  data() {
    return {
      displayRecorder: false
    }
  },
  methods: {
    getSound(sound) {
      console.log('got sound, passing through...')
      this.$emit('sound', sound)
    }
  }
}
</script>

<style lang="scss" scoped>
.record-audio-button {
  display: inline-flex;
}
</style>
