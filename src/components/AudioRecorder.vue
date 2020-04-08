<template>
  <div class="audio-recorder popup">
    <div class="audio-recorder-content">
      <div class="audio-recorder-title b">record audio</div>
      <template v-if="!getUserMedia">
        <div class="audio-recordr-msg">
          Audio recording is not supported in this browser. Please try a
          different browser.
        </div>
      </template>
      <template v-else>
        <div v-if="permissionDenied" class="audio-recordr-msg">
          Please allow access to the microphone to record audio.
        </div>
        <div class="audio-recorder-rec-btns">
          <div v-if="!recording" class="btn" @click="record">record</div>
          <div v-else class="btn" @click="stop">stop</div>
        </div>
        <div class="audio-recorder-time">
          00:02
        </div>
        <div class="audio-recorder-new-btns">
          <div class="btn" @click="saveAndNew">save &amp; new</div>
          <div class="btn" @click="saveAndQuit">save &amp; quit</div>
        </div>
        <div class="audio-recorder-quit-btns">
          <div class="btn btn-sm" @click="newRecording">discard &amp; new</div>
          <div class="btn btn-sm" @click="quit">discard &amp; quit</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import AudioRecorder from 'audio-recorder-polyfill'
if (window.MediaRecorder == null) {
  window.MediaRecorder = AudioRecorder
}

export default {
  data() {
    return {
      recorder: null,
      getUserMedia: null,
      permissionDenied: false,
      recording: false,
      lastRecording: null
    }
  },
  mounted() {
    this.getUserMedia = this.checkSupport()
  },
  methods: {
    checkSupport() {
      // check support for getUserMedia:
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia
      }
      return (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        null
      )
    },
    record() {
      // Request permissions to record audio
      this.getUserMedia({ audio: true })
        .then(stream => {
          this.permissionDenied = false
          this.recording = true
          this.recorder = new MediaRecorder(stream)

          this.recorder.addEventListener('dataavailable', e => {
            this.lastRecording = e.data
            this.recording = false
          })

          // Start recording
          this.recorder.start()
        })
        .catch(() => {
          this.permissionDenied = true
        })
    },
    stop() {
      // Stop recording
      this.recorder.stop()
      // Remove “recording” icon from browser tab
      this.recorder.stream.getTracks().forEach(i => i.stop())
    },
    saveAndNew() {},
    saveAndQuit() {},
    newRecording() {},
    quit() {
      this.$emit('close')
    }
  }
}
</script>

<style>
.audio-recorder-content {
  position: absolute;
  top: calc(50% - 100px);
  left: calc(50% - 8rem);
  width: 16rem;
  height: 200px;
  text-align: center;
}
.audio-recorder-title {
  margin-bottom: 0.5rem;
}
</style>
