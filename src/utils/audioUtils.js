import Meyda from 'meyda'

export default {
  getRecorder() {
    const constraints = { audio: true }
    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // getUserMedia is supported normally
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(stream => resolve(stream))
          .catch(e => reject(e))
      } else {
        // polyfill adapted from https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
          // no support
          reject(
            new Error('navigator.mediaDevices.getUserMedia is not supported.')
          )
        } else {
          const getUserMedia =
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia
          getUserMedia.call(navigator, constraints, resolve, reject)
        }
      }
    })
  },
  analyzeMfcc(
    buffer,
    hopSize = 512,
    numCoefficients = 40,
    normalize = val => (val + 100) / 255
  ) {
    Meyda.numberOfMFCCCoefficients = numCoefficients
    Meyda.bufferSize = hopSize
    const data = buffer.getChannelData(0)
    const numSamples = data.length
    const numHops = Math.floor(numSamples / hopSize)
    const spectrogram = []
    for (let i = 0; i < numHops; i++) {
      const dataSlice = data.slice(i * hopSize, (i + 1) * hopSize)
      // extract features
      let features = Meyda.extract(['mfcc'], dataSlice).mfcc
      // normalize and clamp to 0-1
      features = features.map(val => Math.min(1, Math.max(normalize(val), 0)))
      spectrogram.push(features)
    }
    return spectrogram
  },
  fileToAudioBuffer(file, sampleRate = 22050) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        const arrayBuffer = e.target.result
        const audioContext = new AudioContext({ sampleRate })
        audioContext.decodeAudioData(
          arrayBuffer,
          audioBuffer => resolve(audioBuffer),
          err => reject(err)
        )
      }
      reader.readAsArrayBuffer(file)
    })
  },
  dataURIToAudioBuffer(dataURI, sampleRate = 22050) {
    return new Promise((resolve, reject) => {
      const blob = this.dataURItoBlob(dataURI)
      const reader = new FileReader()
      reader.onload = e => {
        const arrayBuffer = e.target.result
        const audioContext = new AudioContext({ sampleRate })
        audioContext.decodeAudioData(
          arrayBuffer,
          audioBuffer => resolve(audioBuffer),
          err => reject(err)
        )
      }
      reader.readAsArrayBuffer(blob)
    })
  },
  dataURItoBlob(dataURI) {
    // slightly modified from https://stackoverflow.com/a/12300351/8811010
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const dataURIParts = dataURI.split(',')
    // separate out the mime component
    const mimeString = dataURIParts[0].split(':')[1].split(';')[0]
    // write the bytes of the string to an ArrayBuffer
    const byteString = atob(dataURIParts[1])
    const ab = new ArrayBuffer(byteString.length)
    // create a view into the buffer
    const ia = new Uint8Array(ab)
    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    // write the ArrayBuffer to a blob, and you're done
    const blob = new Blob([ab], { type: mimeString })
    return blob
  },
  calculateMediaDuration(media) {
    // from https://stackoverflow.com/a/55093702/8811010
    return new Promise((resolve, reject) => {
      // set the mediaElement.currentTime  to a high value beyond its real duration
      media.currentTime = Number.MAX_SAFE_INTEGER
      // listen to time position change
      media.ontimeupdate = function() {
        media.ontimeupdate = function() {}
        // setting player currentTime back to 0 can be buggy too, set it first to .1 sec
        media.currentTime = 0.1
        media.currentTime = 0
        // media.duration should now have its correct value, return it...
        resolve(media.duration)
      }
    })
  }
}
