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
      <div class="msg">
        <br />
        Optional: type an url below and every prediction will be sent to it with
        a post request.
      </div>
      <input
        v-model="postRequestUrl"
        class="predict-model-input"
        placeholder="https://localhost"
      />
    </div>
  </div>
</template>

<script>
import UploadSoundButton from '@/components/UploadSoundButton'
import audioUtils from '@/utils/audioUtils'
import imageUtils from '@/utils/imageUtils'
import Terminal from '@/components/Terminal'
import trainingUtils from '@/utils/trainingUtils'
import AudioRecorder from 'audio-recorder-polyfill'

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
      modelReady: false,
      tfModel: null,
      recordingSupported: false,
      recording: false,
      recorder: null,
      postRequestUrl: ''
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
        this.tfModel = tfModel
        this.output.push('Model ready.')
        this.modelReady = true
        // get audio recorder if supported
        audioUtils
          .getRecorder()
          .then(stream => {
            this.recordingSupported = true
            this.recorder = new AudioRecorder(stream)
            this.output.push('Audio recorder ready.')
            // when stream is stopped:
            this.recorder.addEventListener(
              'dataavailable',
              this.processRecording
            )
          })
          .catch(e => {
            this.recordingSupported = false
            this.output.push(
              `Recording sound is not supported in this browser or permission denied. (Error: ${e.message})`
            )
          })
      })
      .catch(err => {
        this.output.push('Encountered an error, check the console.')
        console.log(err)
      })
  },
  methods: {
    processRecording(rec) {
      this.output.push('stop recording.')
      if (!this.hasQuit && !this.hasStopped) {
        this.preprocessFile(rec.data, true)
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
            completeSpectrogram = audioUtils.analyzeSpectrogram(audioBuffer)
            spectrograms = imageUtils.padAndCut(completeSpectrogram)
          } catch (e) {
            this.output.push(`Error ceating spectrograms: ${e.message}`)
          }
          if (oneSpectrogram) {
            this.output.push(spectrograms[0])
            this.predict(spectrograms[0])
          } else {
            this.output.push(`Got ${spectrograms.length} spectrograms:`)
            spectrograms.forEach(spectrogram => {
              this.output.push(spectrogram)
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
      if (this.postRequestUrl) {
        this.sendPostRequest(prediction)
      }
    },
    sendPostRequest(data) {
      this.output.push('\nSending prediction data...')

      const xhr = new XMLHttpRequest()
      xhr.open('POST', this.postRequestUrl)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          this.output.push(`Data sent. Response: ${xhr.responseText}\n`)
        } else {
          this.output.push(
            `Status: ${xhr.status}, statusText: ${xhr.statusText}\n`
          )
        }
      }
      xhr.onerror = () => {
        this.output.push('Request error.\n')
      }
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.send(JSON.stringify({ data }))
    },
    quit() {
      this.stopRecording()
      this.hasQuit = true
      // Remove “recording” icon from browser tab
      this.recorder.stream.getTracks().forEach(i => i.stop())
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
