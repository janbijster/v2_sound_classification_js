const environment =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'

const publicPath = {
  production: '/v2_sound_classification_js/',
  development: '/'
}

module.exports = {
  publicPath: publicPath[environment]
}
