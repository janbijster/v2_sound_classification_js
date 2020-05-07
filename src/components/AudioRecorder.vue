<template>
  <div class="audio-recorder popup">
    <div class="audio-recorder-content">
      <div class="audio-recorder-title b">record audio</div>
      <template v-if="!supported">
        <div class="audio-recordr-msg">
          Audio recording is not supported in this browser or permission is
          denied. Make sure you allow access to the microphone or try a
          different browser.
        </div>
        <div class="btn" @click="quit">close</div>
      </template>
      <template v-else>
        <div class="audio-recorder-rec-btns">
          <div v-if="!recording" class="btn" @click="record">record</div>
          <div v-else class="btn" @click="stop">stop</div>
        </div>
        <div class="audio-recorder-time">
          {{ timePassedFormatted }}
        </div>
        <div
          v-if="!recording && lastRecordingSound"
          class="audio-recorder-new-btns"
        >
          <audio controls :src="lastRecordingSound.file"></audio>
          <div class="btn" @click="saveAndNew">save &amp; new</div>
          <div class="btn" @click="saveAndQuit">save &amp; quit</div>
        </div>
        <div v-if="!recording" class="audio-recorder-quit-btns">
          <div
            v-if="lastRecordingSound"
            class="btn btn-sm"
            @click="newRecording"
          >
            discard &amp; new
          </div>
          <div v-if="lastRecordingSound" class="btn btn-sm" @click="quit">
            discard &amp; quit
          </div>
          <div v-else class="btn" @click="quit">quit</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import audioUtils from '@/utils/audioUtils'
import moment from 'moment'

const convertTimeHHMMSS = val => {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return hhmmss.indexOf('00:') === 0 ? hhmmss.substr(3) : hhmmss
}

export default {
  data() {
    return {
      recorder: null,
      supported: false,
      recording: false,
      lastRecordingSound: null,
      tickIntervalId: null,
      timePassed: 0
    }
  },
  computed: {
    timePassedFormatted() {
      return convertTimeHHMMSS(this.timePassed)
    }
  },
  mounted() {
    // get audio recorder if supported
    audioUtils
      .getRecorder()
      .then(stream => {
        this.supported = true
        this.recorder = new MediaRecorder(stream)
        // when stream is stopped:
        this.recorder.addEventListener('dataavailable', this.processRecording)
      })
      .catch(e => {
        this.supported = false
        alert(e)
      })
  },
  methods: {
    processRecording(recEvent) {
      this.recording = false
      window.clearInterval(this.tickIntervalId)
      // convert to dataUrl
      const reader = new FileReader()
      reader.onload = e => {
        console.log('done encoding.')
        this.lastRecordingSound = {
          name: 'recording ' + moment().format('YYYY-MM-DD HH:mm:ss'),
          type: recEvent.data.type,
          file: e.target.result
        }
      }
      console.log('start encoding...')
      reader.readAsDataURL(recEvent.data)
    },
    record() {
      this.recording = true
      this.lastRecordingSound = null
      this.timePassed = 0
      this.tickIntervalId = window.setInterval(this.tick, 1000)
      console.log('start recording...')
      this.recorder.start()
    },
    stop() {
      console.log('stop recording.')
      if (this.recorder.state == 'recording') {
        this.recorder.stop()
      }
    },
    tick() {
      this.timePassed++
    },
    saveAndNew() {
      this.saveRecording()
      this.newRecording()
    },
    saveAndQuit() {
      this.saveRecording()
      this.quit()
    },
    newRecording() {
      this.lastRecordingSound = null
    },
    saveRecording() {
      if (!this.lastRecordingSound) {
        return
      }
      this.$emit('sound', this.lastRecordingSound)
    },
    quit() {
      if (this.recorder) {
        if (this.recorder.state == 'recording') {
          this.recorder.stop()
        }
        // Remove “recording” icon from browser tab
        this.recorder.stream.getTracks().forEach(i => i.stop())
      }
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
.audio-recordr-msg,
.audio-recorder-time,
.audio-recorder-rec-btns,
.audio-recorder-new-btns {
  margin-bottom: 0.5rem;
}
</style>
