module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    'plugin:vue/recommended',
    'eslint:recommended',
    'prettier/vue'
    // 'plugin:prettier/recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': 'off',
    'no-return-assign': 'off',
    eqeqeq: 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
