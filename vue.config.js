const publicPath = {
  production: '/v2_sound_classification_js/',
  development: '/'
}

module.exports = {
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
