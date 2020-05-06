<template>
  <div class="audio-recorder popup">
    <div class="audio-recorder-content">
      <div class="audio-recorder-title b">record audio</div>
      <template v-if="!supported">
        <div class="audio-recordr-msg">
          Audio recording is not supported in this browser. Please try a
          different browser.
        </div>
        <div class="btn" @click="quit">close</div>
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
import AudioRecorder from 'audio-recorder-polyfill'
if (window.MediaRecorder == null) {
  window.MediaRecorder = AudioRecorder
}

const convertTimeHHMMSS = val => {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return hhmmss.indexOf('00:') === 0 ? hhmmss.substr(3) : hhmmss
}

export default {
  data() {
    return {
      recorder: null,
      supported: false,
      permissionDenied: false,
      recording: false,
      lastRecording: null,
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
    this.supported = this.checkSupport()
  },
  methods: {
    checkSupport() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return true
      } else {
        if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
          // no support
          return false
        }

        // polyfill from https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {}
        }
        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {
          navigator.mediaDevices.getUserMedia = constraints => {
            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia =
              navigator.webkitGetUserMedia || navigator.mozGetUserMedia

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
              return Promise.reject(
                new Error('getUserMedia is not implemented in this browser')
              )
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
              getUserMedia.call(navigator, constraints, resolve, reject)
            })
          }
        }
        return true
      }
    },
    record() {
      // Request permissions to record audio
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          this.permissionDenied = false
          this.recording = true
          this.timePassed = 0
          this.tickIntervalId = window.setInterval(this.tick, 1000)
          this.recorder = new MediaRecorder(stream)
          // when stream is stopped:
          this.recorder.addEventListener('dataavailable', e => {
            this.lastRecording = e.data
            this.recording = false
            window.clearInterval(this.tickIntervalId)
            // convert to dataUrl
            const reader = new FileReader()
            reader.onload = e => {
              console.log('done encoding.')
              this.lastRecordingSound = {
                name: this.lastRecording.name || 'recording',
                type: this.lastRecording.type,
                file: e.target.result
              }
            }
            console.log('start encoding...')
            reader.readAsDataURL(this.lastRecording)
          })

          console.log('start recording...')
          this.recorder.start()
        })
        .catch(e => {
          this.permissionDenied = true
          alert(e)
        })
    },
    stop() {
      console.log('stop recording.')
      this.recorder.stop()
      // Remove “recording” icon from browser tab
      this.recorder.stream.getTracks().forEach(i => i.stop())
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
      this.lastRecording = null
      this.lastRecordingSound = null
    },
    saveRecording() {
      if (!this.lastRecordingSound) {
        return
      }
      this.$emit('sound', this.lastRecordingSound)
    },
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
.audio-recordr-msg,
.audio-recorder-time,
.audio-recorder-rec-btns,
.audio-recorder-new-btns {
  margin-bottom: 0.5rem;
}
</style>
