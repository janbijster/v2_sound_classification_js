export default {
  padAndCut(spectrogram, overlapFraction = 0.5, length = 173) {
    const totalLength = spectrogram.length
    const overlapLength = Math.round(overlapFraction * length)
    const hopSize = length - overlapLength
    const numCuts = Math.ceil((totalLength - overlapLength) / hopSize)
    const spectrograms = []
    for (let i = 0; i < numCuts; i++) {
      const start = i * hopSize
      const end = start + length
      let slicedSpectrogram = spectrogram.slice(start, end)
      if (end > totalLength) {
        const padLength = end - totalLength
        slicedSpectrogram = [
          ...slicedSpectrogram,
          ...spectrogram.slice(0, padLength)
        ]
      }
      spectrograms.push(slicedSpectrogram)
    }
    return spectrograms
  },
  createImageFromSpectrogram(spectrogram) {
    // from https://stackoverflow.com/a/22826906/8811010
    const width = spectrogram.length
    const height = spectrogram[0].length
    const buffer = new Uint8ClampedArray(width * height * 4) // have enough bytes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = (y * width + x) * 4 // position in buffer based on x and y
        const value = spectrogram[x][height - y - 1] * 255
        buffer[pos] = value // some R value [0, 255]
        buffer[pos + 1] = value // some G value
        buffer[pos + 2] = value // some B value
        buffer[pos + 3] = 255 // set alpha channel
      }
    }
    // create off-screen canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    // create imageData object
    const idata = ctx.createImageData(width, height)
    // set our buffer as source
    idata.data.set(buffer)
    // update canvas with new data
    ctx.putImageData(idata, 0, 0)
    var dataURI = canvas.toDataURL() // produces a PNG file
    return dataURI
  }
}
