<template>
  <div class="predict-model popup">
    <div class="predict-model-content">
      <div class="predict-model-title b">
        use model {{ model.name }} for prediction
      </div>

      <div class="btn" @click="quit">quit</div>
    </div>
  </div>
</template>

<script>
// import trainingUtils from '@/utils/trainingUtils'

export default {
  props: {
    model: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      hasQuit: false
    }
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
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
</style>
