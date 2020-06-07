import * as tf from '@tensorflow/tfjs'

export default {
  getModel(numLabels, imageWidth = 173, imageHeight = 40, numChannels = 1) {
    // adapted from https://codelabs.developers.google.com/codelabs/tfjs-training-classfication/index.html#4
    const model = tf.sequential()

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(
      tf.layers.conv2d({
        inputShape: [imageWidth, imageHeight, numChannels],
        kernelSize: 5,
        filters: 32,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
      })
    )

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

    // Repeat another conv2d + maxPooling stack.
    model.add(
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 32,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
      })
    )
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 64,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
      })
    )
    model.add(tf.layers.maxPooling2d({ poolSize: [4, 4], strides: [4, 4] })) // was: model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten())

    model.add(
      tf.layers.dense({
        units: 16, // was: units: 64,
        kernelInitializer: 'glorotUniform',
        activation: 'relu'
      })
    )

    // add dropout
    model.add(tf.layers.dropout({ rate: 0.5 }))

    model.add(
      tf.layers.dense({
        units: numLabels,
        kernelInitializer: 'glorotUniform',
        activation: 'sigmoid'
      })
    )
    return model
  },
  compile(model) {
    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.rmsprop(0.001)
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
    return model
  },
  getModelSummary(model) {
    const summaryLines = []
    model.summary(60, null, line => summaryLines.push(line))
    return summaryLines
  },
  prepareData(
    spectrogramsByLabel,
    imageWidth = 173,
    imageHeight = 40,
    numChannels = 1
  ) {
    // organize data in X and Y
    const labels = spectrogramsByLabel.map(obj => obj.label)
    const numClasses = labels.length
    const X = []
    const Y = []
    spectrogramsByLabel.forEach(({ label, spectrograms }) => {
      const labelIndex = labels.indexOf(label)
      // TODO this may be slow for many samples
      spectrograms.forEach(spectrogram => {
        Y.push(labelIndex)
        X.push(spectrogram)
      })
    })
    const trainSize = X.length
    // console.log(spectrogramsByLabel)
    // console.log(labels, X, Y)

    // TODO put this in a tf.tidy()?
    const trainX = tf
      .tensor3d(X)
      .reshape([trainSize, imageWidth, imageHeight, numChannels])
    // console.log(tf.tensor1d(Y, 'int32'))
    const trainY = tf.oneHot(tf.tensor1d(Y, 'int32'), numClasses)

    return { trainX, trainY }
  },
  train(model, { trainX, trainY }, callbacks = {}, epochs = 1, batchSize = 32) {
    return model.fit(trainX, trainY, {
      batchSize: batchSize,
      epochs,
      verbose: 1,
      shuffle: true,
      callbacks
    })
  },
  predictSpectrogram(tfModel, spectrogram) {
    const X = tf
      .tensor(spectrogram)
      .reshape([1, spectrogram.length, spectrogram[0].length, 1])
    const prediction = tfModel.predict(X)
    return prediction.arraySync()[0]
  },
  scoresToLabelInfo(scores, labels) {
    const maxIndex = scores.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0
    )
    return {
      predictedLabel: labels[maxIndex],
      predictedScore: scores[maxIndex],
      scores: scores.map((score, i) => ({ label: labels[i], score }))
    }
  },
  formatPercentage(num) {
    return Math.round(num * 100)
  },
  formatLabelInfo(labelInfo) {
    return (
      `\nPredicted label: ${labelInfo.predictedLabel} (${this.formatPercentage(
        labelInfo.predictedScore
      )}%)\n\n` +
      labelInfo.scores
        .map(
          ({ label, score }) => `${label}: ${this.formatPercentage(score)} %`
        )
        .join('\n')
    )
  }
}
