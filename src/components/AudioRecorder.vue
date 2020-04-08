<template>
  <div class="audio-recorder popup">
    <div class="btn" @click="record">record</div>
    <div class="btn" @click="stop">stop</div>
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
      recorder: null
    }
  },
  mounted() {
    console.log(window.MediaRecorder)
  },
  methods: {
    record() {
      try {
        // Request permissions to record audio
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          this.recorder = new MediaRecorder(stream)

          this.recorder.addEventListener('dataavailable', e => {
            console.log(e)
            alert(e.data.type)
            // let audioSrc = URL.createObjectURL(e.data)
            // console.log(audioSrc)
          })

          // Start recording
          this.recorder.start()
        })
      } catch (error) {
        alert(error)
      }
    },
    stop() {
      // Stop recording
      this.recorder.stop()
      // Remove “recording” icon from browser tab
      this.recorder.stream.getTracks().forEach(i => i.stop())
    }
  }
}
</script>

<style></style>
