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
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten())

    model.add(
      tf.layers.dense({
        units: 64,
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
  train(model, data) {
    // const metrics = ['loss', 'val_loss', 'acc', 'val_acc']
    // const container = {
    //   name: 'Model Training',
    //   styles: { height: '1000px' }
    // }
    // const fitCallbacks = tfvis.show.fitCallbacks(container, metrics)

    const BATCH_SIZE = 32
    const TRAIN_DATA_SIZE = 5500
    const TEST_DATA_SIZE = 1000

    const [trainXs, trainYs] = tf.tidy(() => {
      const d = data.nextTrainBatch(TRAIN_DATA_SIZE)
      return [d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.labels]
    })

    const [testXs, testYs] = tf.tidy(() => {
      const d = data.nextTestBatch(TEST_DATA_SIZE)
      return [d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.labels]
    })

    return model.fit(trainXs, trainYs, {
      batchSize: BATCH_SIZE,
      validationData: [testXs, testYs],
      epochs: 10,
      verbose: 1,
      shuffle: true
      // callbacks: fitCallbacks
    })
  }
}
