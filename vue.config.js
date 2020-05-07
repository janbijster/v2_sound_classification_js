const webpack = require('webpack')
const fs = require('fs')

const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

const publicPath = {
  production: '/v2_sound_classification_js/',
  development: '/'
}

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        PACKAGE_VERSION: JSON.stringify(version)
      })
    ]
  },
  publicPath: publicPath[process.env.NODE_ENV],
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config.output.filename('[name].[hash].js').end()
    }
  },
  devServer: {
    https: true,
    host: '0.0.0.0'
  }
}
