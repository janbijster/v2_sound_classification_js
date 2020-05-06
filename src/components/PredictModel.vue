<template>
  <div class="predict-model popup">
    <div class="predict-model-content">
      <div class="predict-model-title b">
        use model "{{ model.name }}" for prediction
      </div>
      <terminal class="predict-model-output-holder" :output="output" />
      <upload-sound-button
        v-if="modelReady"
        :multiple="false"
        :return-data-url="false"
        btn-class="btn"
        @sound="preprocessFile"
      />
      <template v-if="recordingSupported">
        <div v-if="!recording" class="btn" @click="record">record</div>
        <div v-else class="btn" @click="stopRecording">stop</div>
      </template>
      <div class="btn" @click="quit">quit</div>
    </div>
  </div>
</template>

<script>
// TODO this code is a little spaghetti and not very DRY.
import UploadSoundButton from '@/components/UploadSoundButton'
import audioUtils from '@/utils/audioUtils'
import imageUtils from '@/utils/imageUtils'
import Terminal from '@/components/Terminal'
import trainingUtils from '@/utils/trainingUtils'

export default {
  components: {
    UploadSoundButton,
    Terminal
  },
  props: {
    model: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      output: [],
      hasQuit: false,
      hasStopped: false,
      modelReady: true,
      tfModel: null,
      recordingSupported: false,
      recording: false,
      recorder: null
    }
  },
  computed: {},
  watch: {},
  mounted() {
    if (!this.model || !this.model.hasTfModel) {
      this.output.push('No tensorflow model.')
      return
    }
    this.output.push('Loading tensorflow model...')
    this.$store
      .dispatch('models/loadTfModel', { model: this.model })
      .then(tfModel => {
        // compile necessary? TODO build this in train and predict functions
        // this.tfModel = trainingUtils.compile(tfModel)
        this.tfModel = tfModel
        this.output.push('Model ready.')
        // this.output.push(...trainingUtils.getModelSummary(this.tfModel))
        this.modelReady = true
      })
      .catch(err => {
        this.output.push('Encountered an error, check the console.')
        console.log(err)
      })
    // check recording support
    this.recordingSupported = this.checkRecordingSupport()
    if (!this.recordingSupported) {
      this.output.push('Recording sound is not supported in this browser.')
    } else {
      this.getRecorder()
    }
  },
  methods: {
    getRecorder() {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          this.recorder = new MediaRecorder(stream)
          // when stream is stopped:
          this.recorder.addEventListener('dataavailable', e => {
            this.output.push('stop recording.')
            if (!this.hasQuit && !this.hasStopped) {
              this.preprocessFile(e.data, true)
            }
          })
        })
        .catch(e => {
          this.output.push(
            'Permission denied for recording. Error: ' + e.message
          )
        })
    },
    checkRecordingSupport() {
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
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    async recordWhenReady() {
      while (!this.hasQuit && !this.hasStopped) {
        await this.sleep(200)
        if (this.recorder.state != 'recording') {
          this.record()
          break
        }
      }
    },
    record() {
      this.hasStopped = false
      this.recording = true
      this.output.push('start recording...')
      this.recorder.start()
      window.setTimeout(() => {
        if (this.recorder.state == 'recording') {
          this.recorder.stop()
          this.recordWhenReady()
        }
      }, 4100)
    },
    stopRecording() {
      this.hasStopped = true
      if (this.recorder.state == 'recording') {
        this.recorder.stop()
      }
      // Remove “recording” icon from browser tab
      this.recorder.stream.getTracks().forEach(i => i.stop())
      this.recording = false
    },
    preprocessFile(file, oneSpectrogram = false) {
      this.output.push('Reading uploaded file...')
      // read file and convert to audio buffer
      audioUtils
        .fileToAudioBuffer(file)
        .then(audioBuffer => {
          this.output.push('Creating spectrograms...')
          let completeSpectrogram, spectrograms
          try {
            completeSpectrogram = audioUtils.analyzeMfcc(audioBuffer)
            spectrograms = imageUtils.padAndCut(completeSpectrogram)
            this.output.push(`Got ${spectrograms.length} spectrograms`)
          } catch (e) {
            this.output.push(`Error ceating spectrograms: ${e.message}`)
          }
          if (oneSpectrogram) {
            this.predict(spectrograms[0])
          } else {
            spectrograms.forEach(spectrogram => {
              this.predict(spectrogram)
            })
          }
        })
        .catch(e => this.output.push(`Error reading file: ${e.message}`))
    },
    predict(spectrogram) {
      if (!this.modelReady) {
        return
      }
      const scores = trainingUtils.predictSpectrogram(this.tfModel, spectrogram)
      const prediction = trainingUtils.scoresToLabelInfo(
        scores,
        this.model.labels
      )
      this.output.push(trainingUtils.formatLabelInfo(prediction))
    },
    quit() {
      this.hasQuit = true
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/style/variables.scss';

.predict-model-content {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  text-align: center;
}
.predict-model-title {
  margin-bottom: 0.5rem;
}
.predict-model-msg {
  margin-bottom: 0.5rem;
}
.predict-model-output-holder {
  height: calc(100% - 6rem);
  margin-bottom: 0.5rem;
}
</style>
